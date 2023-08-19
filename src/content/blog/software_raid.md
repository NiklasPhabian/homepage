---
external: false
draft: false
title: Setting up a software raid
description: pg
date: 2019-06-20
--- 

IT gave me a bunch of 6 TB disks that *possibly* had a few thousand hours left in them. I tossed them in a dumpster-server and configured the RAID as follows

## Format drives
Create linux RAID partitions on every RAID drive

```bash
sudo fdisk /dev/sda
```
Then interactively:
- `g` Not GPT
- `n` New partition
- `t` Change partition type to Linux RAID (29)
- `w` write changes
    
## Create RAID
```bash
sudo mdadm --create /dev/md0 --level=0 --raid-devices=3 /dev/sda1 /dev/sdc1 /dev/sdd1
```
    
## Create Filesystem
```bash
sudo mkdfs.ext4 /dev/md0
```
    
## Mount the raid 

### Ad-Hoc

```bash 
mkdir /raid
sudo mount /dev/md0 /raid
```
    
### Permanent
Get UUID from:

```bash
sudo blikd /dev/md0
```
   
Edit `/etc/fstab` to something like

```bash
UUID=d5413389-a620-4d9d-bf3f-39e9a8647f1b       /raid           ext4 defaults 0 0
```

## Remove RAID
```bash
sudo umount /raid
sudo mdadm --stop /dev/md0
sudo mdadm --remove /dev/md0
```

