---
title: GDAL access to private GCS buckets
description: How to access e.g. COGS on private GCS buckets via GDAL
date: 2023-08-20
---
One of the more frustrating endeavours: Question is how to authenticate ourselves against GCS from gdal. 
Super useful if we e.g. want to add COGs to QGIS.


- https://gdal.org/user/virtual_file_systems.html#vsigs-google-cloud-storage-files
- https://stackoverflow.com/questions/67097942/gdal-reading-rasters-from-a-private-google-cloud-bucket
- https://courses.spatialthoughts.com/gdal-tools.html#extracting-values-from-a-raster


As with so many things with GDAL, stuff is hidden and requires knowledge that I have no idea one would find. 
It is that sourspot just slightly beyond trivial.
Examples are usually very basic. The [gdal documentation](https://gdal.org/user/virtual_file_systems.html#vsigs-google-cloud-storage-files) states the configuration options, but it is not even obvious how to pass them to gdal.

One might think something like could work

```bash
gdalinfo /vsigs/spatialthoughts-public-data/viirs_ntl_2021_global.tif --config GS_SECRET_ACCESS_KEY key --config GS_ACCESS_KEY_ID acces key
```

But I actually have no idea how to correctly pass more than one config parameter to gdal.

What we can do is set `CPL_GS_CREDENTIALS_FILE`


```bash
gdalinfo /vsigs/spatialthoughts-public-data/viirs_ntl_2021_global.tif --config CPL_GS_CREDENTIALS_FILE ~/.boto
```

Now of course nobody really tells you what the .boto config file should look like; well actuall; [this post does](https://stackoverflow.com/questions/67097942/gdal-reading-rasters-from-a-private-google-cloud-bucket).

```bash
[Credentials]
gs_access_key_id=<YOURKEY>
gs_secret_access_key=<YOURSECRET>
```

Of course gdal calls it `gs_access_key_id` and `gs_secret_access_key`, while google gives you an `Access key` and a `Secret`. 
I don't know if this is just me, or if it isn't obvious to anyone. ... I had to guess which one is which:
The `gs_access_key_id` is the `Access key` (the longer one) and the `gs_secret_access_key` is the `Secret`.

![](/images/gs_access_key.png)

With a `~/.boto` in place, QGIS can access COGs in private buckets.
