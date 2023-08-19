---
title: Campus VPN
description: Some settings for UCSB's VPN
date: 2023-08-13
---


## Pulse CLI
```bash
/usr/local/pulse/PulseClient_x86_64.sh -h ps.vpn.ucsb.edu -u $USER -U https://ps.vpn.ucsb.edu/ra -r UCSB-Remote-Access
```

### Issues
https://community.pulsesecure.net/t5/Pulse-Desktop-Clients/pulseUi-doesn-t-work-in-ubuntu-20-04/td-p/42721

```bash
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/pulse/extra/usr/lib/x86_64-linux-gnu/
```



## Openconnect
```bash
sudo apt install openconnect network-manager-openconnect network-manager-openconnect-gnome
sudo openconnect --protocol=nc https://ps.vpn.ucsb.edu/ra
```

```bash
ip tuntap add vpn0 mode tun user $USER
echo $PWD | sudo /usr/sbin/openconnect --protocol=pulse --user=$USER --interface=vnp0 https://ps.vpn.ucsb.edu/ra --passwd-on-stdin
```



