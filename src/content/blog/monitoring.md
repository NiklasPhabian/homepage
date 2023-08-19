---
external: false
draft: false
title: Scripts to monitor system usage
description: pg
date: 2019-08-21
---


## Display disk usage
```bash
while true; do df -h; echo ''; sleep 5; done;
```
 
 
## Display swap usage
```bash
while true; do
    time
    free -h | grep Swap
    sleep 10
done
```


## Log disk usage
```bash
#!/bin/bash

HEADsda1=$(df -h /dev/sda1 | head -n+1)
HEADsdb1=$(df -h /dev/sdb1 | head -n+1)
HEADmem=$(free -h | head -1)

echo "$HEADsda1" > ~/log/sda1.log
echo "$HEADsdb1" > ~/log/sdb1.log
echo "$HEADmem"  > ~/log/mem.log

#echo "                    $HEADsda1      $HEADsdb1                 $HEADmem"
echo "                    $HEADsda1      $HEADsdb1"

while :
do      
        DATE=$(date +"%Y-%m-%d:%H:%M:%S")
        DUSAGEsda1=$(df -h /dev/sda1 | tail -n+2)
        DUSAGEsdb1=$(df -h /dev/sdb1 | tail -n+2)
        MUSAGEHR=$(free -m -h | head -2 | tail -1)
        MUSAGE=$(free -m | head -2 | tail -1)

        echo "$DATE $DUSAGEsda1" >> ~/log/sda1.log
        echo "$DATE $DUSAGEsdb1" >> ~/log/sdb1.log
        echo "$DATE $MUSAGE" >> ~/log/mem.log
        #echo "$DATE $DUSAGEsda1               $DUSAGEsdb1      $MUSAGEHR"
        echo "$DATE $DUSAGEsda1               $DUSAGEsdb1"
        sleep 60
done
```

## Log memory usage
```bash
echo "Date                   Tot  Use  Free    Tot Use Free"
echo "Date                   Tot  Use  Free" > ~/monitor/swap.log

while true; do 
    DATE=$(date +"%Y-%m-%d %H:%M:%S")
    SWAP=$(free -h | grep Swap | sed "s/  */ /g" | cut -d ' ' -f 2-4); 
    MEM=$(free -h | grep Mem  | sed "s/  */ /g" | cut -d ' ' -f 2-4); 
    echo $DATE "  " $MEM "  " $SWAP
    echo $DATE $SWAP >> ~/monitor/swap.log
    sleep 20; 
done;
```






