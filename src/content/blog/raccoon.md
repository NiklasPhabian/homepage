---
title: intel-atom server
description: Notes on my Intel-Atom server
date: 2016-12-13
---

- Cannot install 22.04; crashes during install. But can install 20.04 and dist-upgrade to 22.04


```
df -h
```
 
- Drive is /dev/mapper/ubuntu--vg-ubuntu--lv
- extend the lv
- grow the filesystem

```
sudo lvextend -l +100%FREE /dev/mapper/ubuntu--vg-ubuntu--lv
sudo resize2fs /dev/mapper/ubuntu--vg-ubuntu--lv
```
