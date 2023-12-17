---
external: false
title: System Benchmarking
description: Some commands and results for benchmarking my computers
date: 2021-10-19
--- 

## HDD
### Test 1
```bash
sudo hdparm -Tt /dev/mmcblk0
```

### Test 2
```bash
hdparm -W0 /dev/sda
sudo dd if=/dev/zero of=/home/griessbaum/test bs=8k count=50k conv=fsync;
sudo rm -f /home/griessbaum/test
```

### Test 3
```bash
iozone -e -I -a -s 100M -r 4k -i 0 -i 1 -i 2 [-f /path/to/file]
```

### Results

| System                     | hdparm cached     |  hdparm buffered |    DD                  |
| :--                        | --:               | --:              | --:                    |
|                            |                   |                  |                        |
| victoria                   | 13661.53 MB/sec   |  504.50 MB/sec   |                        |
| DT Samsung SSD 840 (sdc/)  | 12417.72 MB/sec   |  488.77 MB/sec   |                        |
| DT Toshiba Q300 (sdb/)     | 12489.92 MB/sec   |  310.64 MB/sec   |                        |
| DT SPCC (sda/)             | 10930.57 MB/sec   |  398.77 MB/sec   |                        |
| XP (original)              |  5871.42 MB/sec   |  517.80 MB/sec   |    39.7 MB/S           |
| latitude                   |   499.98 MB/sec   |  230.09 MB/sec   |                        |
| Skunk 3.5 (spinning)       |  8037.48 MB/sec   |  191.08 MB/sec   |                        |
| Skunk 2.5 (spinning)       |  7475.88 MB/sec   |   39.32 MB/sec   |                        |
| wort                       |  5907.57 MB/sec   |   57.32 MB/sec   |                        |
| Raccoon                    |   874.59 MB/sec   |  244.81 MB/sec   |                        |
| Rpi (PV)                   |   236.55 MB/sec   |   21.86 MB/sec   |    2.5 MB/sec          |

 
## CPU 
| System        | CPU                                       | Score     |
| :--           | :--                                       | --:       |
| victoria      | Intel(R) Core(TM) i7-4790 CPU @ 3.60GHz   | 9,997     |
| DT            | Intel Core i7-4785T @ 2.20GHz 		    | 7,596     |
| stinkbug      | Intel Core i7-4770 @ 3.40GHz              | 7.275     |
| xps 13        | Intel Core i5-7200U                       | 4,621     |
| latitude      | Intel Core i7-620M @ 2.67GHz 	            | 2,741     |
| skunk		    | Intel Core2 Duo E7300 @ 2.66GHz		    | 1,728     |
|               | Intel Core2 Duo E8600 @ 3.33GHz	        | 2,412     |
| raccoon		| Intel Atom D2700 @ 2.13GHz		        |   844     |
| AO722         | AMD C-60 APU                              |   545     |
| eeepc         | Intel Celeron M ULV 800MHz	            |   184     |
| rpi           | Raspberry Pi Model B Rev 2                |           |
