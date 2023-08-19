---
external: false
draft: false
title: Modifying swap
description: pg
date: 2019-08-21
---


## Swap disk
```bash
sudo mkswap /dev/sde
sudo swapon /dev/sde
```

make permanent in `/etc/fstab` wuth e.g.:

```bash
UUID=0f87d670-a6e9-4d8e-97f6-8720caa520d4 none swap sw 0 0
```
  
## Swap file
```bash
SWAPDIR=/home/swap
sudo mkdir $SWAPDIR
sudo fallocate -l 10G $SWAPDIR/swapfile.swap
```
	
Previous line has bug On centos 7 (2018-12-13). Use this instead:

```bash
sudo dd if=/dev/zero of=$SWAPDIR/swapfile.swap count=40000 bs=1MiB
```

Then:
```bash
sudo mkswap $SWAPDIR/swapfile.swap
sudo chmod 0600 $SWAPDIR/swapfile.swap 
sudo swapon $SWAPDIR/swapfile.swap
```

make permanent in `/etc/fstab`:

```bash
sudo nano /etc/fstab
$SWAPDIR/swapfile.swap swap swap defaults 0 0
```

    

 
