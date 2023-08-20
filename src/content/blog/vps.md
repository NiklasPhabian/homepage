---
title: GCC/AWS VPS checklist
description: quick reminders for setting up VPS
date: 2023-01-05
---

## Passwd
On GCE, I actually don't understand this one; I have no idea what the user password might be. However, when you log in through browser-ssh client, you have passwordless sudo; i.e. you can change the user's password with `sudo passwd`.
After setting the password, other ssh shells also have passwordless sudo.

## SSH
Don't try to add the pubkey manually through`.ssh/authorized_keys`. GCE overwrites the file regularly. Instead, google for 10 minutes to find the freaking webinterface to add the key. Let's see how long this link gets you there.
https://console.cloud.google.com/compute/metadata?tab=sshkeys&project=natcapgeoserver

The following does not work (anymore?).
- https://cloud.google.com/compute/docs/instances/access-overview
- https://stackoverflow.com/questions/65141387/authorized-keys-getting-deleted-from-google-cloud-vm

1. get own public key from `~/.ssh/id_rsa.pub`
1. add the public `.ssh/authorized_keys`
1. `chmod 600 .ssh/authorized_keys`


## Duckdns
- https://www.duckdns.org/install.jsp?tab=linux-cron

I usually set the cron task to 30 minutes and reboot.

```bash
*/30 * * * * ~/duckdns/duck.sh >/dev/null 2>&1
@reboot ~/duckdns/duck.sh >/dev/null 2>&1
```
## Fish/sftp
https://linuxize.com/post/using-the-ssh-config-file/
https://unix.stackexchange.com/questions/419778/kde-dolphin-will-not-connect-to-dropbear-ssh-server

```bash
nano .ssh/config

Host necgeoserver
    HostName necgeoserver.duckdns.org
    User ubuntu
    IdentityFile ~/Dropbox/naturalcapitalconsulting/niklas.pem

chmod 600 ~/.ssh/config
ssh necgeoserver
```
