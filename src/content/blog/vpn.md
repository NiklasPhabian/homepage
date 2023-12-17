---
title: Campus VPN
description: Reminders on how to connect to UCSB's VPN
date: 2023-08-13
---


## Pulse CLI
```bash
/usr/local/pulse/PulseClient_x86_64.sh -h ps.vpn.ucsb.edu -u $USER -U https://ps.vpn.ucsb.edu/ra -r UCSB-Remote-Access
```

Issues:
https://community.pulsesecure.net/t5/Pulse-Desktop-Clients/pulseUi-doesn-t-work-in-ubuntu-20-04/td-p/42721

```bash
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/pulse/extra/usr/lib/x86_64-linux-gnu/
```



## Openconnect
Install:
```bash
sudo apt install openconnect network-manager-openconnect network-manager-openconnect-gnome
```

Connect:
```bash
sudo openconnect --protocol=nc https://ps.vpn.ucsb.edu/ra
```
Or:

```bash
user=
pwd=
ip tuntap add vpn0 mode tun user $user
echo $pwd | sudo /usr/sbin/openconnect --protocol=pulse --user=$user --interface=vnp0 https://ps.vpn.ucsb.edu/ra --passwd-on-stdin
```



