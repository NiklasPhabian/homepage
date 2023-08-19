---
external: false
draft: false
title: Converting a Home Router to a eduroam WiFi Bridge using OpenWRT 
description: Converting a Home Router to a eduroam WiFi Bridge using OpenWRT
date: 2019-08-21
---

## Goal

- Install OpenWRT 18.06.2 on a Netgear WNR3500L (Sam Knows) router
- Configure OpenWRT to connect to WPA-802.1x WiFI (eduroam)

## Context
Over the years of working on acquiring, analyzing, storing, and distributing data, I came to appreciate having my hands on a physical machine that I can use as a server for continuous tasks. I was lucky enough that all the sysadmins in my life have been more than accommodating and would get out of their way to provide me with VMs for such purposes. However a lot of times I have no idea what I am doing at the beginning of a project and break things quickly and pivot erratically. Having my own hardware that I know I could torch and dump into the ocean if I had to has proven to give me some piece of mind (disclaimer: no animals were harmed in the making of this).

Consequently, I have a small server under my desk in my grad-student office alongside my workstation. I love this setup since it allows me to run my continuous tasks (in my case: webscrapes and databases) on the server while my workstation may need restarts and/or infrequently crashes.

Now since I am a cheap grad-student, I typically acquire my serves from dumpsters (people throw away way too nice things). A couple of weeks back, I found a nice new one and thought it was time to retire my old server. Now the issue is that while super helpful, my network admin is increasingly getting uncomfortable with whitelisting dumpster hardware (and generally is not super pumped about the fact that there is hardware in his network he has no control over). So I wanted to find a solution that will make bothering him unnecessary. An easy solution would have been mac-addresses spoofing and/or installing my own router. However, that would feel like a breach of trust and I have great sympathy that having uncontrolled subnets does not feel comfortable for a sysadmin.

Luckily enough, my office has good [eduroam](eduroam.org) coverage. At first I thought I could just get a wifi bridge off amazon and hook it up to a router. However, it turns out that these cheap bridges don't support WPA-802.1x (WPA-Enterprise). I remembered though that there are some routers out that supports third-party firmware that might make it possible to turn a cheap router into an WPA-802.1x bridge. I consequently went and found a Netgear WNR3500L for 8 USD at a local thrift-store. I proceeded to install a third party firmware (OpenWRT) and set the router up to connect to eduroam. Then hooked up my workstation and my servers to the router, and ready was my own subnet outside of the responsibility of my sysadmin. To add some finishing touches, I got a second cheap wifi-router to act as an access-point to have my phone and laptop residing in the same network as the server and workstation (god, I love KDE connect).

## Third-Party Firmware choice: OpenWRT vs DD-WRT
There are tons of articles out there comparing OpenWRT and DD-WRT (and tomato). What I figured from hours on the dd-wrt forum is the following: DD-WRT seems to support WPA-Enterprise in client mode and can easily be configured through the web interface. However, as far as my understanding goes, apparently only for hardware with Atheros chips. If you have one of those, this is probably is the easiest way to go. The WNR3500L however has a broadcom chip and with none of the DD-WRT images I flashed, I could select 802.1x when I switched to client mode. (Retrospectively, I think it is quite likely that I might just done something wrong. Any comments on that would be appreciated.)

I found though, that according to this 10 year old post by [Josef Janitor](http://blog.jozjan.net/2008/12/wrt54gl-as-8021x-client-aka.html), OpenWRT can be configured to work in client mode on an WPA-Enterprise network using a broadcom chip.

Only after I bought the router, I realized that flashing OpenWRT is easier on some routers than on others: For some routers you can simply flash OpenWRT from the web-ui. However, for the majority of hardware, a device-specific custom installation procedure is needed.

## SamKnows
After a couple of failed attempts to upgrade firmware, I came across [this article](https://www.myopenrouter.com/forum/beware-samknows-wnr3500l-v1-software-how-upgrade), which made me realized that I happened to have grabbed a router which must have been part of the [SamKnows](https://www.samknows.com/) project. Before anything else, I therefore had to install [DD-WRT for SamKnows](https://www.myopenrouter.com/download/dd-wrt-samknows-wnr3500l-v24-k26-svn14289-mini-chk) (login required for download; [ddwrt.zip](/homepage/downloads/ddwrt.zip)).

DD-WRT for SamKnows is the DD-WRT mini version. This version only allowed me to me to select `.bin` files for firware upgrades. Therefore I flashed the big DD-WRT afterwards. For my WNR3500L, I found the firmware [here](ftp://ftp.dd-wrt.com/betas/2019/03-27-2019-r39296/broadcom_K26/dd-wrt.v24-39296_NEWD-2_K2.6_big.bin). For other devices, you'd probably download dd-wrt image from [here](https://wiki.dd-wrt.com/wiki/index.php/Index:FAQ#Where_do_I_download_firmware.3F). The [router database](https://dd-wrt.com/support/router-database/?model=WNR3500L_v1) may give you some hints on what to look for. As a side note, [this thread](https://forum.dd-wrt.com/phpBB2/viewtopic.php?t=311850) mentions that the WNR3500L can also run the K3x builds, which I can confirm.

## Attempting to flash OpenWRT
I tried a couple of times to flash OpenWRT from the web-UI and according to the instructions on the OpenWRT device page (scp the image and then mtp, see below). Neither worked for me. Here is a description of my failed attempts:

DD-WRT may not have dhpc activated. If so, you need to assign your workstation a static IP (I used `192.168.1.2`). I then telnetted into the router. The default login name is `root` and password `admin`. At this point the instructions say to copy OpenWRT to the router. You will need to have an ssh server running on your workstation (!). Also, since the ssh client on dd-wrt might be old, you might have to add KexAlgorithm to your ssh server config:

```
sudo echo “KexAlgorithms diffie-hellman-group1-sha1” >> /etc/ssh/sshd_config
sudo service ssh restart
```

Then you should be able to:

```
scp $USERNAME@$IP:$OPENWRTPATH /tmp/
```

The instructions then say to use mtp to flash openwrt:

```
mtp -r write /tmp/openwrt-*.chk linux
```

But that merely soft-bricked the device (green blinking power LED), which seems to have to do with "Only flash a trx, never flash a bin file" I guess?

Fortunately, it turns out one can de-brick the device very easily through tftp. I therefore flashed the latest vendor firmware with tftp. And from the vendor firmware web-UI I flashed OpenWRT. I think that flashing the vendor firmware first was unnecessary; I might have as well have flashed OpenWRT from tftp

```
tftp $192.168.1.1
binary
put $FIRMWARE.chk
```

## Setting up OpenWRT to connect to eduroam
Yey. System booted into OpenWRT and I was able to ssh to it (`ssh root@$IP`; no password). Next, I created a `wpa_supplicant.conf` (e.g. at `/etc/wpa_supplicant.conf`) and scp'd `AddTrust_External_Root.pem` (found it on my Ubuntu workstation at `/etc/ssl/certs/AddTrust_External_Root.pem`) to the router.

My wpa_supplicant.conf looks like this:

```
country=US
network={
    scan_ssid=1
    ssid="eduroam"
    key_mgmt=WPA-EAP
    ca_cert="/etc/AddTrust_External_Root.pem"
    identity="$USER@ucsb.edu"
    anonymous_identity="anonymous@ucsb.edu"
    password="$PASSWORD"
    phase2="auth=MSCHAPV2"
    eap=PEAP
    proto=RSN
}
```

Then, I ran wpa_supplicant with this config file:

```
wpa_supplicant -i wlan0 -c /etc/wpa_supplicant.conf
```

The first issue was that wpa_supplicant couldn't parse the config file; it spat out something like that:

```
Line 6: unknown network field 'eap'.
Line 7: unknown network field 'identity.
Line 8: unknown network field 'phase1'.
Line 9: unknown network field 'phase2'.
Failed to read or parse configuration '/etc/wpa_supplicant.conf'.
```

I figured it was connected to wpad-min vs wpad. OpenWRT comes with wpad-mini installed. I uninstalled that one and installed wpad (Hooked up the WAN port to an internet connection first).

```
opkg update
opkg remove wpad-basic
opkg install wpad
```

The above error consequently disappeared and I was able to obtain an IP address with.

```
udhcpc -i wlan0
```

## Updating to brcmsmac driver to enable wireless-n

The pre-compiled built of openwrt comes with the b43 drivers, which only support wireless-g (I guess up to 54 MBit/s?). However, the imagebuilder provides a pretty easy way to build an image with the brcmsmac driver that supports wireless-n (up to 300 Mbit/s?).

```
make image PROFILE=Broadcom-mips74k-brcmsmac
```

I flashed this newly built image, installed wpad and was ready to go.

Instead of building and flashing a new image, it seems like one could simply change the driver. But I realized that too late.


## Using Luci

Finally, I set up LUCI GUI and made the settings permanent through it.

```
opkg update
opkg install luci
```
