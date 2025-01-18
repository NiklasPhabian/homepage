---
title: Zero to Geoserver
description: How to setup geoserver on AWS
date: 2024-10-01
---

```bash

sudo ethtool -s eno0 wol g
sudo chmod +x /etc/init.d/wol_enable.sh
sudo update-rc.d wol_enable.sh defaults
sudo reboot
```

Sleep the host
```bash
sudo systemctl suspend
```

Wake ikt up from somehwere else:

```bash
wakeonlan -i 192.168.0.12 00:22:4d:7b:8f:2a
```
