---
external: false
draft: false
title: Enable hibernation in ubuntu
description: pg
date: 2021-08-12
--- 
https://askubuntu.com/questions/1240123/how-to-enable-hibernate-option-in-ubuntu-20-04


```bash
sudo apt install pm-utils hibernate
```

```bash
cat /sys/power/state
``` 
should return `freeze mem disk`

Get swap UUID
```bash
grep swap /etc/fstab
```

Enable option in GRUB; edit `/etc/default/grub`. Change 
```bash
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
```
to 
```bash
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash resume=UUID=YOUR_VALUE"
```

Then 
```bash
sudo update-grub
sudo systemctl hibernate
```
