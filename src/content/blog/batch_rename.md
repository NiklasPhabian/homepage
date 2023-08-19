---
external: false
draft: false
title: Batch renaming files
description: pg
date: 2007-07-24
--- 

## Simple rename
```bash
rename -v 's/Concert.*ogg/Concert\.ogg/' *.ogg
```


## Drop a Substring
```bash

SAVEIFS=$IFS
IFS=$(echo -en "\n\b")

ROOTDIR="/home/griessbaum/album/"
cd $ROOTDIR


REMOVE="(Original Soundtrack) "
REPLACE_WITH=""

for FILENAME in *.mp3; 
do
  NEWNAME=${FILENAME/$REMOVE/$REPLACE_WITH}
  echo $NEWNAME
  mv $FILENAME $NEWNAME; 
done

IFS=$SAVEIFS
```


## Remove serial strings

```bash
SERIAL=1
for FILENAME in *.mp3; 
do
  SERIALSTRING=$(printf "%02d" "SERIAL") 
  NEWNAME=${filename/[0-9][0-9]/$SERIALSTRING}
  echo $NEWNAME
  #mv $FILENAME $NEWNAME
  let SERIAL=SERIAL+1
done
```
