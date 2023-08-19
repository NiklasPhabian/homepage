---
external: false
draft: false
title: Adding disks to VPC
description: pg
date: 2017-01-17
---

In web UI:
- Create disk 
- Add disk to instance 
 
Then format discs ([https://cloud.google.com/compute/docs/disks/add-persistent-disk](https://cloud.google.com/compute/docs/disks/add-persistent-disk))
    
```bash
sudo mkfs.ext4 -m 0 -F -E lazy_itable_init=0,lazy_journal_init=0,discard /dev/sdb   
sudo blkid /dev/sdb
```

add entry to `/etc/fstab`
