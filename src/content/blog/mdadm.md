---
title: A mdadm cheet sheet
description: Addressing some of my recurring issues with mdadm
date: 2025-05-04
---

## Intro
I have this old Intel Atom D2700 board that I am using as a NAS. I love the thing since it is a really low power (like 15 W), I guess partially due to the small (300 W) 80+ gold PSU and only using laptop/2.5 inch drives.

The server uses five 1 TB 2.5 inch hard drives (it's what I had lying around) as a RAID-5 array and a small 64 GB SSD for the OS. (The board itself only has two SATA ports, but it also has a *mini* PCI-E slot in which I put a SATA controller card with four more SATA ports). I also put a second SATA controller in the PCI-E slot, but haven't tried if it works together with the mini PCI-E SATA card yet though.

It has been running very solid, but every once in a while when I check, I notice that a drive is removed from the array. Scans of smartctl never show anything alarming, so I am wondering if it is actually an issue with the SATA controller.

Anyway, here is how I reattached the removed disk. It's been working fine now. But if it happens again, I will definitely replace the whole array with new and bigger drives (maybe three 4 TB SSDs since the whole point of this machine is to be ultra-low power)


## Check
To check the health status of a `mdadm` RAID array:

### **Check Overall Status**

```bash
cat /proc/mdstat
```

### Detailed Status of a Specific RAID Array

```bash
sudo mdadm --detail /dev/md0
```

### List RAID Devices and Their Status

```bash
sudo mdadm --examine --scan
```

### Check Disk Health Using SMART

If you suspect a disk issue, you can check its SMART status:

```bash
smartctl -a /dev/sdf
```

## Add Drive (back)
For me, `sudo mdadm --detail /dev/md0` showed `/dev/sdf1` as **removed**. So I wanted to add it back:

### Identify the Missing/Removed Drive

Ensure the drive is physically connected and detected by the system:

```bash
lsblk
sudo fdisk -l
```

### Re-add the Drive to the RAID

Once you confirm the disk is available, add it back to the array:

```bash
sudo mdadm --add /dev/md0 /dev/sdf1
```

#### Adding fails with error:
The above command yielded:

```bash
"mdadm: Failed to write metadata to /dev/sdf1"
```

Which was a bit alarming. I first tried wiping the metadata

```bash
sudo wipefs -a /dev/sdf1
sudo dd if=/dev/zero of=/dev/sdf1 bs=1M count=100
```

The adding still failed, so I checked dmesg:

```bash
dmesg | grep sdf
```

Which showed me even more alarming news:

```bash
Buffer I/O error on dev sdf1, logical block 25343, lost async page write
```

I then ran a long smartctl test:

```bash
sudo smartctl -t long /dev/sdf
```

And it passed with no error. So I zeroed the whole drive:

```bash
sudo dd if=/dev/zero of=/dev/sdf bs=1M status=progress
```

Then repartitioned:
```bash
sudo parted /dev/sdf --script mklabel gpt
sudo parted /dev/sdf --script mkpart primary 0% 100%
```

And set partition type:
```bash
sudo fdisk /dev/sdf
```
- Press t to change type
- Choose fd (Linux RAID autodetect)
- Press w to write and exit


Verified all looks as it should:

```bash
lsblk /dev/sdf
```

And finally was able to re-add:

```bash
sudo mdadm --add /dev/md0 /dev/sdf1
```

### Check the rebuild status:

```bash
cat /proc/mdstat
sudo watch mdadm --detail /dev/md0
```
