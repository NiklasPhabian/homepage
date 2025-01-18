---
title: Misalignment in VIIRS and MODIS gridded data
description: I think the moderate and imager bands of MODIS and VIIRS are not aligned correctly
date: 2023-08-31
---

There is something that I actually don't understand about L2G data. When we look at the bounds, or at the affine transformation of the 1km and the hkm dataset, we see that both have the same x and y offsets; i.e. the top left corner of both datasets are at the same location.

I actually think this is a mistake. When you look at e.g. page 2-6ff of [MOD28 ATBD](https://modis.gsfc.nasa.gov/data/atbd/atbd_mod28_v3.pdf), you see that four 500 m pixels do NOT nest within one 1 km pixel; much rather, six do. So when interpolating the geolocations for the 500 m data (geolocation data only exist for 1 km data), you need to remember this and offset in across-track observations by half a pixelsize.

I think this is ignored when the 500 m L2G data is produced. You can actually pretty clearly see the problem when you throw I1 and M5 data as-is into (Q)GIS and toggle between them; features in the I5 are shifted 250 m left and up.

How it naively looks:

![](/homepage/l2gmisalignment/unshifted.gif)

How it should look (after moving pixels 25 m left and up):

![](/homepage/l2gmisalignment/shifted.gif)


In [STAREMaster_py](https://github.com/SpatioTemporal/STAREMaster_py/blob/master/staremaster/products/mod09.py#L33), I implemented a method to (hopefully) correctly interpolate the 500 m iFOV center locations according to the [MOD28 ATBD](https://modis.gsfc.nasa.gov/data/atbd/atbd_mod28_v3.pdf)
