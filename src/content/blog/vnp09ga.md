---
title: Processing VIIRS L2G data
date: 2023-08-31
description: How to read and process L2G data
---

# Loading Data
Loading gridded data in python has always been nightmare to me. 
Whenever tasked, I am confused about how to approach it.
I'd think we can read HDF5 and NetCDF4 with 
- h5py
- h5netcdf
- netCDF
- rasterio
- rioxarray
- osegeos/GDAL

But every time, I forget the pros and cons about either approach.

## GDAL:
I am somewhat frighten of using the GDAL python bindings directly. In their nature, they are not necessarily pythonic.
On top of that, one needs to be a bit careful when installing the GDAL python bindings.
If you have the system gdal installed and install the python bindings from pip, you will end up without hdf support.
Simple way of going about that is uninstalling the system libgdal and installing gdal from conda-forge.
This may end up breaking the QGIS and you might have to reinstall it after.

```bash
sudo apt remove libgdal-dev gdal-bin
conda install -c conda-forge gdal
```

## netCDF4:
I am most familiar with netCDF4 and is the most straightforward to me.
However, you need to take care of all the EOS (transformations+crs) stuff yourself

## h5py/h5netcdf
I have no experience with them. 

## Rasterio
Super convenient for geotiffs. The documentation keeps on confusing me though since everything seems to be written under the assumption
of immediately writing data back out to a geotiff.

## rioxarray
Really powerful and seems to be combining the best of all worlds. 
I occasionally get confused about the xarray datastructure and occasionally wonder if there might be situations where the datastructure might be limiting.

```python
import rioxarray
ds = rioxarray.open_rasterio("VNP09GA.A2023100.h08v05.002.2023105183328.h5", parse_coordinates=True, mask_and_scale=True)
```

The first point of confusion here is that ds is not a not an `xarray.dataset`, but a list of two; one for each (resolution).
This simply because there is no 1:1 mapping of an hdf/netcdf datastructure to a `xarray.dataset`.
Maybe one of the reasons why I feel a bit more comfortable with `netcdf4`.

I actually don't understand how rioxarray finds the two groups; GDAL must know the EOS layout, I guess?

Anyways, let's split the dictionary:
```python
rds_1km = ds[0]
rds_hkm = ds[1]
```

# Scaling
As of 2023-08-31, there seems to be something off with the parsing of the `scale_factor`.
With `mask_and_scale=True`, in `open_rasterio`, we get incorrectly scaled values.
We can re-read the dataset without `mask_and_scale` and check the scale value:

```python

rds_1km['HDFEOS_GRIDS_VIIRS_Grid_1km_2D_Data_Fields_SurfReflect_M1_1'].scale_factor
```

We get a value of `1.0`, which is not correct.
We can check with gdal e.g

```bash
gdalinfo HDF5:"VNP09GA.A2023100.h08v05.002.2023105183328.h5"://HDFEOS/GRIDS/VIIRS_Grid_1km_2D/Data_Fields/SurfReflect_M5_1 
```

and will see that the `scale_factor` is actually `9.9999997e-05`.
You can also see the correct value by looking at the global dataset attributes:

```python
rds_1km.attrs['HDFEOS_GRIDS_VIIRS_Grid_1km_2D_Data_Fields_SurfReflect_M3_1_scale_factor']
```

We should apply this scale factor!

I.e.

```python
variable = 'HDFEOS_GRIDS_VIIRS_Grid_1km_2D_Data_Fields_SurfReflect_M1_1'
data = rds_1km[variable].data 
scale_factor_name = f'{variable}_scale_factor'
scale_factor = rds_1km.attrs[scale_factor_name]
rds_1km[variable].data = data * scale_factor
```

# Clipping to BBOX
We can use:

```python 
rds_1km.rio.clip_box(minx=minx, miny=miny, maxx=maxx, maxy=maxy)
```

to clip the DataArrays. The x and y values are in projected coordinates. If you want to clip by raster index values, you need to transform them first. Grab the transform from the dataset, create a transformer, and the transform the x and y coordinates:

```python
transform = rds_1km.rds.rio.transform()
transformer = rasterio.transform.AffineTransformer(transform) # 
minx, miny = transformer.xy(i_xmin, i_ymin)
maxx, maxy = transformer.xy(i_xmax, i_ymax)
clipped = rds_1km.rio.clip_box(minx=minx, miny=miny, maxx=maxx, maxy=maxy)
```

# Reprojecting / Resample
This is surprisingly easy. What we do during reprojecting is the following:
1. Define a resolution. We either do this 
    - explicitly by stating how high and wide each pixel should be, or 
    - implicitly by providing a shape, i.e. stating how many rows and columns the new raster should have
    - implicitly by omitting the resolution on shape. rioxarray will keep the resolution close to the input ... I think
1. Assign a CRS, allowing us to translate the projected coordinates to geographic coordinates.
1. Assign an affine transformation to resolve how each array index value is transformed into a projected coordinate system. The affine transformation can implicitly be generated from the resolution and extent/bounds.
1. Resample data. You need to specify a method on how to select values for your new grid from the old grid. I think this is often forgotten, because we often reproject with relative constant resolution, thus defaulting to nearerst-neighbor is typically good enough. The resampling is a fuction of the [`rasterio.enums.Resamping`](https://rasterio.readthedocs.io/en/stable/api/rasterio.enums.html#rasterio.enums.Resampling)

```python
resampling=rasterio.enums.Resampling.nearest
rds_1km.rio.reproject(crs, resolution=resolution, resampling=resampling)
```

If we wanted to just upsample a dataset, we could do e.g.

```python
factor = 1
resampling=rasterio.enums.Resampling.nearest
rds_1km.rio.reproject(rds_1km.rio.crs, resolution = rds_1km.rio.resolution*factor, resampling=resampling)
```

# Plotting
Here a quick way of plotting some bands:


```python
def make_plotable(rds):
    rgb = rds.to_array().data
    rgb = numpy.nan_to_num(rgb)
    rgb = rasterio.plot.reshape_as_image(rgb)
    p2, p98 = numpy.nanpercentile(rgb, (2, 98))                                                         
    rgb_stretched = skimage.exposure.rescale_intensity(rgb, in_range=(p2, p98))                         
    rgb_stretched = skimage.exposure.adjust_gamma(rgb_stretched, 0.5)                                   
    return rgb_stretched
    
rgb = rds_1km[['HDFEOS_GRIDS_VIIRS_Grid_1km_2D_Data_Fields_SurfReflect_M5_1',
               'HDFEOS_GRIDS_VIIRS_Grid_1km_2D_Data_Fields_SurfReflect_M4_1',
               'HDFEOS_GRIDS_VIIRS_Grid_1km_2D_Data_Fields_SurfReflect_M3_1']]

fig, ax = plt.subplots(figsize=(16,9))              
plotable = make_plottable(rgb)
ax.imshow(plotable,  alpha=0.9)
```

We can also toss the raster out as a geotiff and plot it in a GIS:
```python
rgb.rio.to_raster('rgb.tif')
```

# Sharpening
It actually blows my mind how simple this is.
Let's first pull out a pan-band.

```python
pan = vnp_hkm.rds['HDFEOS_GRIDS_VIIRS_Grid_500m_2D_Data_Fields_SurfReflect_I1_1']
```

and resample our rgb data to 500 m:

```python
factor = 2
resampling=rasterio.enums.Resampling.nearest
rgb_upsample = rgb.rio.reproject(rgb.rio.crs, resolution = rgb.rio.resolution*factor, resampling=resampling)
```

We can calculate the intensity of each pixel with:
```python
intensity = rgb_upsample.to_array().sum(axis=0)
```

And then get a sharpend image with e.g.

```python
sharp = rgb_upsample / intensity * pan
```
or

```python
sharp = 0.5*rgb_upsample + pan
```

A bit more involved; first transform the image to HSV, replace the V and translate back to RGB.

```python
import skimage
rgb = rgb_upsample.to_array().data
rgb = numpy.nan_to_num(rgb)
rgb = rasterio.plot.reshape_as_image(rgb)
hsv = skimage.color.rgb2hsv(rgb)
hsv[:,:, 2] = pan.data
rgb = skimage.color.hsv2rgb(hsv)

sharp = copy.copy(rgb_upsample)
sharp['HDFEOS_GRIDS_VIIRS_Grid_1km_2D_Data_Fields_SurfReflect_M5_1'].data = rgb[:,:,0]
sharp['HDFEOS_GRIDS_VIIRS_Grid_1km_2D_Data_Fields_SurfReflect_M4_1'].data = rgb[:,:,1]
sharp['HDFEOS_GRIDS_VIIRS_Grid_1km_2D_Data_Fields_SurfReflect_M3_1'].data = rgb[:,:,2]
```
