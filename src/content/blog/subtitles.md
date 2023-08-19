---
external: false
draft: false
title: Extracting and converting subtitles
description: pg
date: 2007-07-24
--- 

There was a time where I had a raspberry-pi (I think a 2b) set up as a media player. Hardware acceleration was only possible through the OMX player. However, the OMX player could only read subtitles from external `srt` files.

Here some scripts to extract the subtitles from mkv and mp4 containers:


## Extract from mp4
```bash
# Remove spaces in filenames
for filename in *.mp4 ;
do   
    echo "${filename// /_}"
    mv "$filename" ${filename// /_} ; 
done

# Extract subtitles
for filename in *.mp4 ; 
do
    echo "${filename/mp4/srt}"
    MP4Box -srt 3 "$filename"
done

# Rename subtitles
for filename in *.srt ; 
do
  echo "${filename/_3_text/}"
  mv "$filename" ${filename/_3_text/} ;   
done
```


## Extract from mkv
```bash
for filename in *.mkv ; 
do
    echo "${filename/mkv/srt}"
    if [ -e "${filename/mkv/srt}" ]
    then
        echo "already exists"
    else
        mkvextract tracks "$filename" 2:"${filename/mkv/srt}"
    fi
done
```

## Convert from ass (lol) to srt
```bash
for i in *.ass ; 
    do ffmpeg -i "$i" "$i.srt" ; 
done
```

## Add subtitles into container


### add to mp4
```bash 
ffmpeg -i infile.mp4 -i infile.srt -c copy -c:s mov_text outfile.mp4
```

 
### burn the subtitles into the video

First convert the subtitles to .ass format:
```bash
ffmpeg -i subtitles.srt subtitles.ass
```
    
Then add them using a video filter:

```bash
ffmpeg -i mymovie.mp4 -vf ass=subtitles.ass mysubtitledmovie.mp4
ffmpeg -i infile.mp4 -f srt -i subtitles.srt -c:v copy -c:a copy -c:s srt -metadata:s:s:0 language=nor outfile.mkv
```
