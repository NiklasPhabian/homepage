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
