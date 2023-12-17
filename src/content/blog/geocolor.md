---
title: Create GOES geocolor animations
description: How to create an animation of GOES geoColor images
date: 2022-08-20
tags: random
---

Make an animation from GOES images 

- [For California from CONSUS](https://youtu.be/Em2qaTRl5jY)
- [For California from PACUS](https://youtu.be/DQMPm-SWVvs)



Grab data from https://www.star.nesdis.noaa.gov/goes/

```python
#!/usr/bin/python3
import wget
import os
import datetime
import time
import pandas
import schedule


folder_pacus = '/tablespace/xcal/geoColor/pacus/'
url_pacus = 'https://cdn.star.nesdis.noaa.gov/GOES17/ABI/CONUS/GEOCOLOR/GOES17-ABI-CONUS-GEOCOLOR-5000x3000.tif'

folder_conus = '/tablespace/xcal/geoColor/conus/'
url_conus = 'https://cdn.star.nesdis.noaa.gov/GOES16/ABI/CONUS/GEOCOLOR/GOES16-ABI-CONUS-GEOCOLOR-5000x3000.tif'

def download(url, folder):
    fname = url.split('/')[-1]
    now = pandas.Timestamp.now()
    print(f'{now}')
    datestr = datetime.datetime.strftime(now, '%Y-%m-%d_%H%M')
    wget.download(url, out=folder)
    print('\n')
    fname_new = fname.replace('GEOCOLOR-5000x3000', f'{datestr}')
    os.rename(f'{folder}/{fname}', f'{folder}/{fname_new}')


def continous():
    schedule.every().hour.at(':00').do(download)
    schedule.every().hour.at(':30').do(download)
    while True:
        try:
            schedule.run_pending()
        except Exception as exception:
            print('Could not download. Trying again')
            print(exception)
        time.sleep(1)


if __name__ == '__main__':
    download(url=url_conus, folder=folder_conus)
    download(url=url_pacus, folder=folder_pacus)
```

Resize the image
```bash
# Resize 
find . -name "*.tif" | parallel -j 60 convert -resize 20% {} {}.png

# Crop to cali
find ../tifs/ -name "*.tif" | parallel -j 60  convert -crop 1600x900+1300+1300 -fill white -pointsize 50 -annotate +1300+1400 '{}' {} ../cali/{}.png

ffmpeg -r 24 -pattern_type glob -i '*.png' -c:v libx264 -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -crf 24 -pix_fmt yuv420p 0_animation.mp4

rm *.png
```



```Makefile
all: cali_pacus cali_conus

cali_pacus:
	find ../pacus/ -name "*.tif" | parallel -j 60  convert -crop 1600x900+6600+1400 -fill white -pointsize 50 -annotate +6600+1500 '{}' {} ../cali/{}.png
	
	mv ../pacus/*.png .

	ffmpeg -y -r 24 -pattern_type glob -i '*.png' -c:v libx264 -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -crf 24 -pix_fmt yuv420p cali_pacus.mp4

	rm *.png
	
cali_conus:
	find ../conus/ -name "*.tif" | parallel -j 60  convert -crop 1600x900+1300+1300 -fill white -pointsize 50 -annotate +1300+1400 '{}' {} ../cali/{}.png
	
	mv ../conus/*.png .

	ffmpeg -y -r 24 -pattern_type glob -i '*.png' -c:v libx264 -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -crf 24 -pix_fmt yuv420p cali_conus.mp4

	rm *.png
```
