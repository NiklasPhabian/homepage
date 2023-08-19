---
title: Serve COG from S3 via Geoserver
description: How to serve cloud optimized GeoTIFFs from S3 via Geoserver to GIS
date: 2023-08-18
---

## References
- https://gis.stackexchange.com/questions/180222/large-geotiff-files-on-geoserver
- https://docs.geoserver.org/latest/en/user/production/data.html#setup-geotiff-data-for-fast-rendering

## Create a virtualenv
```bash
conda create -n nec 
conda activate nec
conda install -c conda-forge mamba
mamba install -c conda-forge gdal
wget https://raw.githubusercontent.com/OSGeo/gdal/master/swig/python/gdal-utils/osgeo_utils/samples/validate_cloud_optimized_geotiff.py
sudo mv validate_cloud_optimized_geotiff.py /usr/local/bin/
sudo chmod +x /usr/local/bin/validate_cloud_optimized_geotiff.py
```

Also, let's install latest GDAL (COG is relatively new)
```bash
sudo add-apt-repository ppa:ubuntugis/ubuntugis-unstable
sudo apt install gdal
```
## Make cogs 
From [geo-solutions.it](https://docs.geoserver.geo-solutions.it/edu/en/enterprise/raster.html#deciding-when-to-go-beyond-and-use-mosaicking-plugins):

"As long as the size of the dataset (again, beware that proper compression can help greatly to reduce the size of the disk) is reasonable (by experience below 20 to 30 GB) with respect to the disks speed we can use individual geotiff for our datasets without problems. Notice that this means that if you received a mosaic of a large number of small files we are implicitly suggesting that the best option you have is to merge them into a single, larger, properly preprocessed file (and `gdal_merge` or `gdalbuildvrt` is your friend for this first step)."

I.e. as long as we don't work with huge data, we want to merge the tiffs to one:

```bash
FILE=2010.tif 
gdal_merge.py -n 0 -a_nodata 0 -o $FILE *.tif
```

### IR Band

Careful, the inputs have 4 bands. We also have Photometric Interpretation: RGB color, but the extra band is not defned. We can change the tag to 'EXTRASAMPLE_UNSPECIFIED'. [The ExtraSamples tag is tag 338](https://www.awaresystems.be/imaging/tiff/tifftags/extrasamples.html). We set its value (position 1) to 0 (EXTRASAMPLE_UNSPECIFIED).

```bash
tiffset -s 338 1 0 $FILE
```


### Warping
We probably want to warp the 

```bash
gdalwarp $FILE ${FILE/.tif/_3857.tif} -t_srs EPSG:3857
```
If we had to iterate over files:
```bash
for filename in folder/*.tif
do
    f=$(basename $filename)
    echo $f    
done
```

### Converting to COG

https://gdal.org/drivers/raster/cog.html

Without further adjustments, the following command will convert to COG. It creates the overviews AND the tiles. 
- The tile size defaults to 512x512. 
- Default for OVERVIEWS is set to auto, meaning that they will be generated if they did not exist in the inputs.
- If OVERVIEW_COUNT is not specified and OVERVIEWS are generated, the default number of overview levels is such that the dimensions of the smallest overview are smaller or equal to the BLOCKSIZE value (Blocksize being the tile size).

```bash
gdal_translate ${FILE/.tif/_3857.tif} ${FILE/.tif/_rgb.tif} -a_nodata 0 -of COG -co COMPRESS=LZW -co BIGTIFF=YES -b 1 -b 2 -b 3

gdal_translate ${FILE/.tif/_3857.tif} ${FILE/.tif/_irg.tif} -a_nodata 0 -of COG -co COMPRESS=LZW -co BIGTIFF=YES -b 4 -b 1 -b 2

python3 validate_cloud_optimized_geotiff.py ${FILE/.tif/_rgb.tif}
python3 validate_cloud_optimized_geotiff.py ${FILE/.tif/_irg.tif}
```

We can verify with `tiffinfo`. We should see multiple TIFF directories, each being tiled.

Additional flags to consider
- BIGTIFF=YES : can be more than 4 GB
- COMPRESS

We could also generate the overviews first with `gdaladdo` and then tile with `gdal_translate` while copying the overviews:
```bash
gdaladdo -r average input.tif 2 4 8 16 
gdal_translate -of COG -co TILED=YES -co COPY_SRC_OVERVIEWS=YES input.tif output.tif
```

## Upload S3 

### Set up bucket
1. Create a bucket on aws
1. Upload file into bucket
1. Leve block public access
1. Create S3 bucket access key https://medium.com/@shamnad.p.s/how-to-create-an-s3-bucket-and-aws-access-key-id-and-secret-access-key-for-accessing-it-5653b6e54337. 


### Install aws CLI
Don't install `aws` from repo. [AWS quickstart guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-services-s3-commands.html)
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
sudo ./aws/install --bin-dir /usr/local/bin --install-dir /usr/local/aws-cli --update
```

### Configure aws cli to set access key
```bash
aws configure
```

### Upload
```bash
aws s3 cp ${FILE/.tif/_rgb.tif} s3://usdasalt/
aws s3 cp ${FILE/.tif/_irg.tif} s3://usdasalt/
```
## Add Store+layer in geoserver
Using S3 bucket access key 

## Add to arconline
URL:
https://necgeoserver.duckdns.org/geoserver/wms?authkey={authkey}


## Issues

- error `Unable to write data from S3 to the destination ByteBuffer.`
        - maybe too little memory on EC2 ins5tance
- error `Could not find a scanline extractor for PlanarImage`
	- We can only serve up 3 bands!
        - https://gis.stackexchange.com/questions/26993/serving-4-band-geotiff-in-geoserver-2-1-4

