---
external: false
draft: false
title: MDADM Raid
description: Setting up a softwar raid
date: 2022-09-02
---

# Intro

Machine with following disks and specs


| Device    | Model            | Size   | hours | startups  | labek     |
| :--       | :--              | --:    | --:   | --:       | --:       |
| /dev/sda  | ST1000LM049-2GH1 | 931.51 |  1872 |  165      | raiddisk4 |
| /dev/sdb  | Hitachi HDS72302 | 1.82   | 15724 | 1096      |           |
| /dev/sdc  | ST1000LM024 HN-M | 931.51 |  5390 |  894      | raiddisk3 |
| /dev/sdd  | ST1000LM049-2GH1 | 931.51 |  1610 |  513      | raiddisk2 |
| /dev/sde  | SPCC Solid State | 59.63  | 11010 |  161      |           |
| /dev/sdf  | ST1000LM024 HN-M | 931.51 |  4462 |  899      | raiddisk1 |
| /dev/sdd  | ST1000LM048-2E71 | 931.51 |  3915 |  134      | raiddisk5 |

# Set up disks


```bash
sudo wipefs -a /dev/sdX
sudo mdadm --zero-superblock /dev/disk/by-partlabel/raiddisk1
```

Then run parted on each disk
```bash
sudo parted /dev/sdX
(parted) mklabel gpt
(parted) mkpart primary ext4 0% 100%
(parted) name 1 raiddisk
(parted) set 1 raid on
(parted) print
(parted) quit
```

Gould have done it with fdisk:
```bash
sudo fdisk /dev/sda
```
Then interactively:
- `g` Not GPT
- `n` New partition
- `t` Change partition type to Linux RAID (29)
- `w` write changes


Create the array:
```bash
sudo mdadm --create --verbose /dev/md0 --level=5 --raid-devices=4 /dev/disk/by-partlabel/raiddisk1 /dev/disk/by-partlabel/raiddisk2 /dev/disk/by-partlabel/raiddisk3 /dev/disk/by-partlabel/raiddisk4
```

Watch the progress (took about 8 hours)
```bash
watch cat /proc/mdstat
```

Make FS and mount it

```bash
sudo mkfs.ext4 /dev/md0
sudo mkdir /mnt/myraid
```

Edit fstab:

```bash
echo '/dev/md0    /mnt/myraid    ext4    defaults    0    0' | sudo tee -a /etc/fstab
```

# Add a disk
```bash
sudo mdadm --add /dev/md0 /dev/disk/by-partlabel/raiddisk5
sudo mdadm --detail /dev/md0
```

The disk was added as a spare. Now we can grow the array:

```bash
mdadm --grow --raid-devices=5 /dev/md0
```

```bash
sudo e2fsck -f /dev/md0
sudo resize2fs /dev/md0


sudo mdadm --detail --scan | sudo tee -a /etc/mdadm/mdadm.conf
```

# Issues
At some point, I restarted the nas, and the array went missing.

`cat /proc/mdstat` showed that the array was inactive, so did `mdadm --detail /dev/md0`

When doing `mdadm --manage /dev/md0 --run`, I got "cannot start dirty degraded array".
After this command, `mdadm --detail /dev/md0` would tell me that some disks were removed.

`/etc/mdadm/mdadm.conf` did not contain an entry for the array, so I tried to do ` mdadm --examine --scan >> /etc/mdadm/mdadm.conf` (as suggested [here](https://www.claudiokuenzler.com/blog/1346/mdadm-raid-array-failed-drive-inactive-after-boot)

Doing `echo "clean" > /sys/block/md0/md/array_state` as suggested e.g. [here](https://forums.debian.net/viewtopic.php?t=142536) did not work as I got `cat invalid arguments`.


I finally followd [this advice](https://www.linuxquestions.org/questions/linux-server-73/mdadm-error-replacing-a-failed-disk-909577/#post4513523)

Stoped the array

`mdadm -S /dev/md0`

The force-reassemble:

mdadm --asssmble --forec /dev/md0 /dev/sda1 /dev


# Mount via sshfs fuse
```bash
griessbaum@10.0.0.4:/home/griessbaum/    /home/griessbaum/raccoon/       fuse.sshfs   noauto,delay_connect,_netdev,user,IdentityFile=/home/griessbaum/.ssh/id_rsa     0 0
```

# Create NFS export

edit `/etc/exports'
```bash
/path/to/export/ 10.0.0.0/24(rw,async,subtree_check,crossmnt)
```

restart:
```bash
exportfs -ra
```

Mount on the client via:

```bash
apt install nfs-common
```

edit `/etc/fstab`

```bash
10.0.0.4:/home/griessbaum/ /home/griessbaum/raccoon_nfs/ nfs user,rw,noauto 0 0
```

Consider ansync; ChatGPT says:
"the sync mount option in an NFS mount can significantly impact write performance. When you use the sync option, it forces synchronous writes, meaning that the NFS server will not acknowledge a write request until the data has been physically written to the disk. This behavior ensures data consistency but can result in slower write performance.

If you are experiencing poor write performance and can tolerate some level of data inconsistency in case of server crashes or failures, you might consider using the async option instead. The async option allows the NFS server to acknowledge write requests as soon as they are received, without waiting for the data to be written to the disk. This can improve write performance but introduces a slight risk of data loss in case of a server crash."



# Add samba
```bash
sudo apt-get install samba
sudo nano /etc/samba/smb.conf

[Movies]
        path = /home/griessbaum/raid/movies
        writable = no
        gues ok = no
        read only = yes
```

```bash
sudo smbpasswd -a your_username
sudo systemctl restart smbd
```

On the windows client:

```bash
\\your_linux_server_ip\ShareName
```

# Monitor health using MDADMMON

```bash
sudo apt install nginx
```

```bash
sudo nano /etc/mdadm/mdadm.conf
MONITOR pid file=/var/run/mdadm/mdadmmon.pid
```

```bash
```

sudo nano /etc/nginx/sites-available/mdadmmon
server {
    listen 8080;
    server_name _; #matche any host name.

    location / {
        root /usr/share/mdadm/;
        index index.html;
    }
}

sudo ln -s /etc/nginx/sites-available/mdadmmon /etc/nginx/sites-enabled/

sudo ufw allow 8080
sudo ufw reload
```
