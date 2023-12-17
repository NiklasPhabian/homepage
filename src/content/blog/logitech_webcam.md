---
title: CLI commands for logitech webcam
description: Some settings for my logitech cameras
date: 2022-05-23
--- 

## List commands
```bash
v4l2-ctl -d /dev/video2 --list-ctrls
```

## Focus / Zoom
```bash
v4l2-ctl -d /dev/video2 --set-ctrl=focus_auto=0
v4l2-ctl -d /dev/video2 --set-ctrl=focus_absolute=20
v4l2-ctl -d /dev/video2 --set-ctrl=zoom_absolute=100
```

## Settings that worked in my garage
```bash
v4l2-ctl -d /dev/video0 --set-ctrl=white_balance_temperature_auto=0
v4l2-ctl -d /dev/video0 --set-ctrl=white_balance_temperature=4700
v4l2-ctl -d /dev/video0 --set-ctrl=saturation=100
v4l2-ctl -d /dev/video0 --set-ctrl=brightness=100
```

## Settings that worked in my office
```bash
v4l2-ctl -d /dev/video0 --set-ctrl=white_balance_temperature_auto=0
v4l2-ctl -d /dev/video0 --set-ctrl=white_balance_temperature=4700
```

## Settings that worked in my homeoffice with a C920
```bash
v4l2-ctl -d /dev/video0 --set-ctrl=white_balance_temperature_auto=0
v4l2-ctl -d /dev/video0 --set-ctrl=white_balance_temperature=4500
v4l2-ctl -d /dev/video0 --set-ctrl=saturation=90
v4l2-ctl -d /dev/video0 --set-ctrl=brightness=120
```

