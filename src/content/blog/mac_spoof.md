---
external: false
draft: false
title: Spoofing mac address
description: How change mac address
date: 2018-07-23
--- 

This used to be super helpful when e.g. airport would only give you 30 minutes free wifi.

- add e.g. `hwaddress ether A4-19-E2-94-DD-BB` to end of `/etc/network/interfaces`
- `sudo /etc/init.d/networking restart`

Even easier:

```bash
sudo apt install macchanger
sudo ifconfig wlp3s0 down
sudo macchanger -r wlp3s0
sudo ifconfig wlp3s0 up
```
