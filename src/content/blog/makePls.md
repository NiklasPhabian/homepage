---
external: false
draft: false
title: Creating m3u playlist files for whole music collection
description: A script to scan directories for music and create a .m3u per folder
date: 2015-05-31
--- 

Before spotify and all the smart home stuff, I used to have a fairly big local music collection on a NAS. I hooked up a raspberry pi with a decent DAC and played my music through a remote-controlled VLC player. It often clumsy to play a whole album without a playlist file. So I used this script to create a playlist for each album:


```bash
echo "Enter folder name: "
#read RootFolder
RootFolder="/home/phabian/SBMusic/"
echo "You entered: $RootFolder"
cd $RootFolder

SAVEIFS=$IFS
IFS=$(echo -en "\n\b")

getaFolder () {

for folder in */
do 
  echo $folder
    subdircount=`find $folder -maxdepth 1 -type d | wc -l`    
  cd $folder
  if [ $subdircount -gt 1 ] ;
  then     
    echo "Subdirs exists"
    getaFolder
  fi
  
  if ls *.m3u &> /dev/null; then
    echo "m3u exists. Removing that cunt now."
    rm *.m3u
  fi
  count1=`ls -1 *.mp3 2>/dev/null | wc -l`
  count2=`ls -1 *.flac 2>/dev/null | wc -l`
  count3=`ls -1 *ogg 2>/dev/null | wc -l`
  count4=`ls -1 *m4a 2>/dev/null | wc -l`
  sumCount=$(($count1+$count2+$count3+$count4))  
  if [ $sumCount -gt 0 ];  then
    ls -w 1 | grep --regexp=".*\mp3\|flac\|ogg\|m4a" --> 00_playlist.m3u  
  fi
  cd ..
done
}

getaFolder
IFS=$SAVEIFS
``bash
