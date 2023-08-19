---
external: false
title: "Upgrading Buffalo Linkstation Mini NAS (LS-WGL)"
description: "Upgrading Disks of Buffalo Linkstation Mini NAS (LS-WGL)"
date: 2019-08-21
---


I have two Buffalo mini Linkstations. I love them. They are quiet, use very little power thanks to the 2.5 inch disks, and the RAID 1 makes me less worried about  loosing my data. One of the two linkstations, a LS-WGL came with two 250 GB disks and I figured it was a good time to upgrade to two 1 TB disks, now that they are that cheap (+- 40 USD each).

Due to the old age of the NAS, documentation seem out to data and most links rotten. This is a merge of instructions from various sources. Mainly from:

- [forums.buffalotech.com](http://forums.buffalotech.com/index.php?topic=3926.0)
- [https://blog.aaronhastings.me/](https://www.aaronhastings.me/)
- [buffalo.nas-central.org](http://buffalo.nas-central.org/wiki/Revert_Buffalo_Linkstation_Mini_To_Stock_Firmware)

The steps for me involved:

1. Open the linkstation according to [http://buffalo.nas-central.org/wiki/Category:LS-WSGL/R1](http://buffalo.nas-central.org/wiki/Category:LS-WSGL/R1) and replace hard drives.
2. Directly connect the linkstation to a computer via ethernet cable. The linkstation will assign itself an IP of `192.168.11.150`. You therefore need to assign a fixed IP address to our computer in the same subnet (e.g. `192.168.11.1`). When we start up the NAS with the new disks, it will not boot, but rather flash a red LED.
3. Push the emergency boot image to the NAS through TFTP by running the `TFTP Boot.exe`. I was actually able to run this from wine and didn't even need windows. Watch out. There are various versions of the `TFTP Boot.exe` for different models. For the LS-WGL, we need [this](http://download.discountnetz.com/tftp-boot-recovery/TFTP_Boot_Recovery_LS-WSGL_1.05.exe) one. If the link breaks, googling "TFTP_Boot_Recovery_LS-WSGL_1.05.exe" might get you somewhere. With the "TFTP Boot.exe" running, we push the function button on the NAS. The TFTP boot application will display something like 
  ```
  Client 192.168.11.150 ... Blocks Served
  Client 192.168.11.150 ... Blocks Served
  ```
4. We don't want to see a timeout here. If we do, we might either have the wrong boot recovery or set our IP address wrong. The NAS now will be in Emergency mode. Note: the IP address in emergency mode changed and now should be `169.254.59.100`. (You can verify this in the [NAS Navigator2](https://www.buffalotech.com/products/linkstation-mini)).
5. Finally, flash the firmware. But we first need to change our computer's IP address to match the subnet the NAS now is in, e.g. to `169.254.59.2`. Then, we run the `LSupdater.exe` of the lswsgl-106 archive obtained from [buffalotech](https://www.buffalotech.com/products/linkstation-mini). It will tell us that the drives are not formatted and suggests to format them, which is what we want.

