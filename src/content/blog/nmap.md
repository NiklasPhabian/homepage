---
external: false
draft: false
title: nmap cheat-sheet
description: pg
date: 2020-08-16
--- 

I keep on forgetting how to use nmap; here a quick reminder.


Search for http port on all 256 devices in class C network. (Super helpful to find the routers and APs in the networ)
```bash
nmap -p 80 192.168.0.0/24
```

Or in class B (not sure why would I ever need this).
```bash
nmap -n -p 80 192.168.0.0/16
nmap -Pn -p 80 192.168.0.0/16
```

- `-Pn` : Treat all hosts as online -- skip host discovery
- `-n/-R`: Never do DNS resolution/Always resolve [default: sometimes]


## Ping scan
```bash
nmap -sn 192.168.1.0/24
```

