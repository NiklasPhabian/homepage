---
title: ffmpeg cheatsheet
description: some reminders on ffmpeg
date: 2023-06-20
---

## GPU acceleration
Very good instructions at [cyberciti](https://www.cyberciti.biz/faq/how-to-install-ffmpeg-with-nvidia-gpu-acceleration-on-linux/)
I did minor modifications

### Get latest CUDA (Step 3)
If you install CUDA from canonical repos, you get version 11.5; install v12 [straight from NVIDIA](https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=Ubuntu&target_version=22.04&target_type=deb_local) instead.

```bash
nvcc --version
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-ubuntu2204.pin
sudo mv cuda-ubuntu2204.pin /etc/apt/preferences.d/cuda-repository-pin-600
wget https://developer.download.nvidia.com/compute/cuda/12.2.1/local_installers/cuda-repo-ubuntu2204-12-2-local_12.2.1-535.86.10-1_amd64.deb
sudo dpkg -i cuda-repo-ubuntu2204-12-2-local_12.2.1-535.86.10-1_amd64.deb
sudo cp /var/cuda-repo-ubuntu2204-12-2-local/cuda-*-keyring.gpg /usr/share/keyrings/
sudo apt update
sudo apt -y install cuda
```

This probably warrants a restart since the graphics drivers might get updated.

nvcc is not on path; put it:
```
export PATH="/usr/local/cuda-12.2/bin:$PATH"
```

### libraries to be installed (Step 7)
```bash
sudo apt-get install nasm libx264-dev libx265-dev libnuma-dev libvpx-dev libfdk-aac-dev libopus-dev libaom-dev libass-dev libmp3lame-dev libvorbis-dev libvpx-dev libx265-dev libx264-dev
```

### Compile (Step 8)
check where cuda got installed, for me: `/usr/lib/cuda/` rathern than `/usr/local/cuda`.

```bash
./configure \
--enable-cuda-nvcc \
--enable-libnpp \
--extra-cflags=-I/usr/local/cuda-12.2/include \
--extra-ldflags=-L/usr/local/cuda-12.2/lib64 \
--enable-gpl \
--enable-libaom \
--enable-libass \
--enable-libfdk-aac \
--enable-libfreetype \
--enable-libmp3lame \
--enable-libopus \
--enable-libvorbis \
--enable-libvpx \
--enable-libx264 \
--enable-libx265 \
--enable-nonfree
```

There seem to be issues:
- https://trac.ffmpeg.org/ticket/8948
- https://forums.developer.nvidia.com/t/nvdec-fails-on-file-requires-29-threads-surfaces-thus-fails-on-3-threads/240827


## Batch-compressing lecture recordings
- https://unix.stackexchange.com/questions/28803/how-can-i-reduce-a-videos-size-with-ffmpeg

I am compressing with H265 and constant rate factor of 28

```bash
ffmpeg -i ESM263_2021-01-05_Zoom_video.mp4 -vcodec libx265 -crf 28 output.mp4
~/nvidia/ffmpeg/ffmpeg -hwaccel cuda -i ESM263_2021-01-05_Zoom_video.mp4 -vcodec libx264 -crf 28 output.mp4
~/nvidia/ffmpeg/ffmpeg -y -vsync 0 -hwaccel cuda -hwaccel_output_format cuda -i ESM263_2021-01-05_Zoom_video.mp4 -c:a copy -c:v h264_nvenc -b:v 5M output.mp4


```

```bash
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
        else
            for video in *.mp4
            do
            echo video
            done
        fi       

        cd ..
    done
}

getaFolder
```


