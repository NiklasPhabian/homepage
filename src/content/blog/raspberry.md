---
title: Setting up my Raspberry Pi
description: Just a few steps to set up my Raspberry Pi for various uses
date: 2023-09-23
---

## Intro
I have two Raspberry PIs 1B that I have been using for various applications.

As of 2023-09-23, I am using Kernel version: 6.1; Debian version: 11 (bullseye).


## General Setup 
find out which Raspbery Pi:

```bash
cat /proc/cpuinfo
```

### Enable SSH
Place a file named `ssh` on the boot partition.

```bash
sudo mount /dev/sdd1 /media/griessbaum/
sudo touch /media/griessbaum/ssh
sudo umount /media/griessbaum/
```

[source](https://stackoverflow.com/questions/41318597/ssh-connection-refused-on-raspberry-pi)

### Add users

Add a file `userconf` to the boot partition, containing: 

```bash
username:<encrypted-password>
```

Encrypt a password, e.g. with:
```bash
echo 'yourpassword' | openssl passwd -6 -stdin
```

Copy over public key
```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub griessbaum@192.168.2.106
```


[Source](https://raspberrypi.stackexchange.com/questions/137915/standard-passwort-not-accepted-headless-setup)
### raspi-config 
```bash
sudo raspi-config 
```

- Expand filesystem
- Switch to en_US.UTF-8
- WIFI
- reboot

### Increase swapsize  
```bash
sudo nano /etc/dphys-swapfile 
CONF_SWAPSIZE=1000
sudo /etc/init.d/dphys-swapfile stop
# sudo /etc/init.d/dphys-swapfile start
```

## WLAN

Easiest through raspbi-conig


### Fix mac address:

```bash
sudo nano /etc/dhcpcd.conf
```
Add lines
```bash
noarp
interface wlan0
static hwaddress ether XX:XX:XX:XX:XX:XX
```

Maybe, we also need to
```bash
sudo nano /etc/NetworkManager/NetworkManager.conf
```

```bash
[device]
wifi.scan-rand-mac-address=no
```




## Syncing some folders with unison
```bash
apt install rsync
ssh-keygen -t rsa
ssh-copy-id -i ~/.ssh/id_rsa.pub phabian@192.168.1.105

crontab -e
# 0 * * * * /home/phabian/sync.sh
```

```bash
nano sync.sh
```
Containing:

```bash
unison -batch /home/phabian/jupyter/ ssh://phabian@192.168.1.105//home/phabian/Dropbox/
```


(install unison on both rpi and host)

## Mount NAS 
```bash
echo "username=" > /home/griessbaum/smbcred
echo "password=" >>  /home/griessbaum/smbcred
chmod 700 smbcred
mkdir /home/griessbaum/XYZ
sudo nano /etc/fstab
```

```
//192.168.2.101/XYZ/          /home/griessbaum/XYZ     cifs    user,credentials=/home/phabian/smbcred,iocharset=utf8,sec=ntlm,vers=1.0 0 0
```


## Add an OFF switch

[source](http://www.raspberry-pi-geek.com/Archive/2013/01/Adding-an-On-Off-switch-to-your-Raspberry-Pi/(offset)/6)

### Prequisites

```bash
sudo apt install python3-rpi.gpio
sudo adduser griessbaum gpio

ls -l /dev/gpiomem 
```
should yield:
```
crw-rw---- 1 root gpio 244, 0 Dec 28 22:51 /dev/gpiomem
```


### Create script
```bash
nano soft_shutdown.py 
```
    
```python
import subprocess
import RPi.GPIO as gpio

def loop():
    input()

def shutdown(pin):
    print('button pushed')    
    subprocess.run(['sudo', 'shutdown', '-h', 'now'])
```

### Set pin numbering to board numbering
gpio.setmode(gpio.BOARD)

- Set up pin 7 as an input: `gpio.setup(7, gpio.IN)`
- Set up an interrupt to look for button presses: `gpio.add_event_detect(7, gpio.RISING, callback=shutdown, bouncetime=200)`
-  Run the loop function to keep script running `loop()`


### Allow user to execute sudo w/o password
```bash
sudo visudo
griessbaum ALL=(ALL) NOPASSWD:ALL
```


### Automatically start script
Add to rc.local
```bash
sudo nano /etc/rc.local
python3 /home/griessbaum/soft_shutdown.py &
```


Add a script to start on startup
```bash
echo "python3 soft_shutdown.py &" > soft_shutdown.sh
crontab -e
```



## Webcam

```bash
sudo apt-get install motion
sudo nano /etc/motion/motion.conf
sudo nano /etc/default/motion
``` 

```bash
ssh 192.168.1.204 ./webcam.sh
```



## Deluge (Torrent client )
[source](https://www.howtogeek.com/142044/how-to-turn-a-raspberry-pi-into-an-always-on-bittorrent-box/)


```bash
sudo apt install deluged deluge-console
deluged sudo pkill deluged
nano .config/deluge/auth
```
add line with user:password:level

deluged deluge-console
    ->  config -s allow_remote True
    ->  exit
```bash
sudo killall deluged
deluged 
```

### Web UI
```
deluge-web
nano .config/deluge/web.conf
deluge-web
```

## VPN
[source](http://flailingmonkey.com/installing-vpn-from-the-linux-command-line/)

```bash
sudo apt install openvpn
cd ~
mkdir openvpn
cd openvpn
wget https://www.privateinternetaccess.com/openvpn/openvpn.zip
unzip openvpn.zip
rm openvpn.zip
```

```bash
sudo nano login.conf
```
- your-privateinternetaccess-username
- your-privateinternetaccess-password

```bash
sudo chmod 400 login.conf
```

```bash
nano Netherlands.ovpn     
auth-user-pass login.conf
```

```bash
sudo cp crl.rsa.2048.pem /etc/openvpn
sudo cp ca.rsa.2048.crt /etc/openvpn
sudo cp login.conf /etc/openvpn
sudo cp Netherlands.ovpn /etc/openvpn/Netherlands.conf
```

```bash
sudo nano /etc/openvpn/Netherlands.conf
```
-> prefix auth-user-pass, crl-verify, and ca with /etc/openvpn/
crl-verify /etc/openvpn/crl.rsa.2048.pem    
auth-user-pass /etc/openvpn/login.conf
ca /etc/openvpn/ca.rsa.2048.crt

    

### make autostart
```bash
sudo nano /etc/default/openvpn 
```
    -> AUTOSTART=Netherlands

chrome plugin delugeshypon


## Jupyter
https://medium.com/analytics-vidhya/jupyter-lab-on-raspberry-pi-22876591b227
```bash
sudo apt install python3
sudo apt install python3-pip
pip3 install --upgrade pip
pip3 install jupyterlab
reboot
jupyter notebook --generate-config
```

Verify
`which jupyter-lab`


### Make secure
Hash a password

```bash
python3
from notebook.auth import passwd
passwd()
```
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:1024 -keyout jupyter.key -out jupyter.pem
nano ~/.jupyter/jupyter_notebook_config.py
```

### Set options for certfile, ip, password, and toggle off
```bash
# browser auto-opening
c.NotebookApp.certfile = '/home/griessbaum/jupyter.pem'
c.NotebookApp.keyfile = '/home/griessbaum/jupyter.key'

# Set ip to '*' to bind on all interfaces (ips) for the public server
c.NotebookApp.ip = '0.0.0.0'
c.NotebookApp.password = u'sha1:bcd259ccf...<your hashed password here>' # From up there
c.NotebookApp.open_browser = False

# It is a good idea to set a known, fixed port for server access
c.NotebookApp.port = 9999
```

### Packages Matplotlib
- Installing matplotlib from pip will result in. `ImportError: libopenblas.so.0: cannot open shared object file: No such file or directory`
The followings piphould solve it: `sudo apt install libopenblas-dev`
- `pip install pandas --no-cache-dir`



### Install R Kernel
Make sure we have enough sawp

```bash
sudo apt install r-base r-base-dev
```

get conda
wget https://repo.continuum.io/miniconda/Miniconda3-latest-Linux-x86.sh



#### Install irkernel
```bash
sudo apt install libcurl4-openssl-dev
sudo apt install libssl-dev
sudo apt install libssh2-1-dev
sudo apt install libxml2-dev libxslt-dev 
sudo apt install libcurl-ocaml-dev
install.packages(c('repr', 'IRdisplay', 'evaluate', 'crayon', 'pbdZMQ', 'devtools', 'uuid', 'digest'))
```

if R < 3.2: either 
```bash
options(repos='http://cran.rstudio.com/')
options(download.file.method = "wget")
install.packages('RCurl')
```

or update R
```bash
sudo nano /etc/apt/sources.list
deb http://mirrordirector.raspbian.org/raspbian/ jessie main contrib non-free rpi
deb http://archive.raspbian.org/raspbian/ stretch main  

devtools::install_github('IRkernel/IRkernel')
IRkernel::installspec(user = FALSE)
```


#### Install ggplot
```R
install.packages('ggplot2', repos='http://cran.us.r-project.org')
```


#### installing rJava
```bash
apt install openjdk-8-jdk
R CMD javareconf 
sudo R 
install.packages("rJava", "/home/phabian/anaconda3/lib/R/library")
```


## Backup/Restore

See which device

```bash
sudo fdisk -l
```

### Backup 
```bash
DATE=$(date +%Y-%m-%d)
FILENENDING=_Raspberrypy.img
```

- As gz: 
```bash 
sudo dd if=/dev/sdx status=progress conv=fsync | gzip > $DATE$FILENENDING.gz
```
- As raw img 
```bash
sudo dd if=/dev/sdx of=~/$DATE$FILENENDING status=progress conv=fsync
```


### Restore
FILENAME=2018-03-01_Raspberrypy.img.zip

- From gz: 
```bash
gunzip --stdout $FILENAME | sudo dd bs=4M of=/dev/sdx status=progress conv=fsync
```
- From raw img 
```bash
sudo dd bs=4M if=$FILENAME of=/dev/sdx status=progress conv=fsync
```




## Media Player
```bash
sudo usermod -aG audio griessbaum
```

### Audio output
```bash
sudo nano /etc/asound.conf 

"pcm.!default 
{
  type plug
  slave 
    {
      pcm "hw:1,0"
    }
}

ctl.!default 
{
  type hw
  card 1
}"
```


### Autostart VLC
```bash
sudo apt-get install vlc-nox
su
mkdir /etc/vlc/
printf "sudo -u phabian cvlc -I http -d --http-password 'siegfried' > /dev/null" > /etc/vlc/vlc_server.sh
chmod +x /etc/vlc/vlc_server.sh
sudo crontab -e
"@reboot /etc/vlc/vlc_server.sh"
```

### Mopidy
```bash
wget -q -O - https://apt.mopidy.com/mopidy.gpg | sudo apt-key add -
sudo wget -q -O /etc/apt/sources.list.d/mopidy.list https://apt.mopidy.com/jessie.list
sudo apt-get update
sudo apt-get install mopidy mopidy-spotify python-pip mopidy-youtube
sudo apt-get install sudo apt-get install gstreamer1.0-plugins-bad gstreamer1.0-plugins-base gstreamer1.0-plugins-ugly gstreamer1.0-plugins-good
sudo pip install Mopidy-MusicBox-Webclient
sudo dpkg-reconfigure mopidy
sudo mopidyctl config
sudo nano /etc/mopidy/mopidy.conf

[http]
enabled = true
hostname = 0.0.0.0
port = 6680
static_dir =
zeroconf = Mopidy HTTP server on $hostname

[spotify]
enabled = true
username = 
password =   
```


### Fix HDMI (enable HDMI sound)
```bash
sudo nano /boot/config.txt
hdmi_force_hotplug=1
hdmi_drive=2
```


### OMXPlayer
```bash
sudo apt install omxplayer screen
sudo usermod -aG video griessbaum
omxplayer /opt/vc/src/hello_pi/hello_video/test.h264
```

hdmi audio (also in remote:)
```bash
omxplayer -o hdmi FILENAME
```

#### subtitles issues:
```bash
sudo apt install fonts-freefont-ttf
```

Error `COMXAudio::Decode timeout`
```bash
sudo echo "gpu_mem=128" >> /boot/config.txt
```


### Switch to DAC
```bash
sudo nano /etc/asound.conf 
pcm.!default 
{
  type plug
  slave 
    {
      pcm "hw:1,0"
    }
}

ctl.!default 
{
  type hw
  card 1
}
```


