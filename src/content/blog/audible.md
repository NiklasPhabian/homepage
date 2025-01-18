---
title: Extract aax files
description: Converting AAX into mp3 files
date: 2017-01-17
tags: random
---

## audible-cli
https://github.com/mkb79/audible-cli

Get the Authcode

```bash
mkvirtualenv audible
pip install audible-cli
audible-quickstart
audible activation-bytes
```

Activation Carol: 43314538
Activation Niklas: a4a3e627 

## audible-activator
Inactive project

```bash
wget https://github.com/inAudible-NG/audible-activator/archive/refs/heads/master.zip
unzip master
rm master
mkvirtualenv audible
pip3 install selenium==4.0 requests
```
## aaxtomp3
https://github.com/KrumpetPirate/AAXtoMP3

```bash
sudo apt-get install ffmpeg x264 x265 bc
wget https://github.com/KrumpetPirate/AAXtoMP3/archive/refs/heads/master.zip
unzip master.zip
rm master.zip
cd AAXtoMP3-master/
./interactiveAAXtoMP3
./AAXtoMP3 -e:mp3 -c -l 1 --authcode a4a3e627 ../TheSubtleArtofNotGivingaFckACounterintuitiveApproachtoLivingaGoodLife_ep6.aax 
```

