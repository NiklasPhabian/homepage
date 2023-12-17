---
title: Pseud-Pansharpen VIIRS using gdal
date: 2023-09-31
description: How to Pansharpen RGB bands of MOD09GA data using GDAL only
---


```bash
# Extract RGB band and throw it into a single tiff, and clip it
gdal_translate HDF5:"VNP09GA.A2023100.h08v05.002.2023105183328.h5"://HDFEOS/GRIDS/VIIRS_Grid_1km_2D/Data_Fields/SurfReflect_M5_1 gdal/b5.tif
gdal_translate HDF5:"VNP09GA.A2023100.h08v05.002.2023105183328.h5"://HDFEOS/GRIDS/VIIRS_Grid_1km_2D/Data_Fields/SurfReflect_M4_1 gdal/b4.tif
gdal_translate HDF5:"VNP09GA.A2023100.h08v05.002.2023105183328.h5"://HDFEOS/GRIDS/VIIRS_Grid_1km_2D/Data_Fields/SurfReflect_M3_1 gdal/b3.tif
gdal_merge.py -separate gdal/b5.tif gdal/b4.tif gdal/b3.tif -o gdal/1km.tif
gdal_translate -srcwin 700 210 100 50 gdal/1km.tif gdal/1km_clip.tif

# Reproject to 3310 (just for fun)
gdalwarp -t_srs EPSG:3310 gdal/1km_clip.tif gdal/1km_3310.tif 

# Extract pan band and clip it
gdal_translate HDF5:"VNP09GA.A2023100.h08v05.002.2023105183328.h5"://HDFEOS/GRIDS/VIIRS_Grid_500m_2D/Data_Fields/SurfReflect_I1_1 gdal/pan.tif
gdal_translate -srcwin 1400 420 200 100 gdal/pan.tif gdal/1km_pan_clip.tif

# Pansharpen
gdal_pansharpen.py gdal/pan.tif gdal/1km.tif gdal/sharpen.tif
``` 
