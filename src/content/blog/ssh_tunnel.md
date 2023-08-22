---
title: SSH tunneling
description: quick ssh tunnel cheat-sheet
date: 2022-08-19
---

I keep on forgetting how SSH tunneling works. Here a few reminders/ usecases

https://goteleport.com/blog/ssh-tunneling-explained/

## Reach a http webserver 
https://docs.dask.org/en/stable/diagnostics-distributed.html#connecting-to-the-dashboard

Create a ssh tunnel to natcapgeoserver.duckdns.org. Then shove everything that I request on localhost on port 1234 to
port 8080 on the host
```bash
ssh -N -L 1234:127.0.0.1:8080 natcapgeoserver.duckdns.org
```


## Forgot what I am doing here
https://www.digitalocean.com/community/tutorials/how-to-route-web-traffic-securely-without-a-vpn-using-a-socks-tunnel

ssh -p 8023 -D 8123 -f -C -N griessbaum@holyromanpv.duckdns.org

then setup browser manual proxy to SOCKS host:
localhost Port 8123
