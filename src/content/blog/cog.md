---
title: Serve COGs from S3/GCS via Geoserver to ArcOnline
description: How to serve cloud optimized GeoTIFFs from S3 via Geoserver to a GIS
date: 2023-08-18
---

## Intro
A friend of mine had created a pretty nice ArcOnline webmap for a client. He wanted to include a bit more data; namely USDA aerial imagery.
If one is willing to pay ESRI to host data, this is all pretty straightforward. Simply upload the data and add it to the map.
However, this can become pricey pretty quickly. 

Thankfully, ESRI allows to add external datasources to ArcOnline maps as well; namely through OGC's [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) (but of course not S3 hosted [cloud optimized geotiffs (COGs)](https://www.cogeo.org/) directly ... Something that QGIS happily does).

The objective of this undertaking was to host data cheaply and serve it through WMS to ArcOnline. The steps involved were:
1. Convert each dataset into a single COG
1. Upload the COGs to S3
1. Add the COGs as stores to a geoserver
1. Connect arconline to the geoserver via WMS


## References
- https://gis.stackexchange.com/questions/180222/large-geotiff-files-on-geoserver
- https://docs.geoserver.org/latest/en/user/production/data.html#setup-geotiff-data-for-fast-rendering

## Install packages
We create a conda environment and install `validate_cloud_optimized_geotiff.py`

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
sudo apt install gdal-bin
```

## Make cogs 
### Merge multiple Geotiffs into One
From [geo-solutions.it](https://docs.geoserver.geo-solutions.it/edu/en/enterprise/raster.html#deciding-when-to-go-beyond-and-use-mosaicking-plugins):

"As long as the size of the dataset (again, beware that proper compression can help greatly to reduce the size of the disk) is reasonable (by experience below 20 to 30 GB) with respect to the disks speed we can use individual geotiff for our datasets without problems. Notice that this means that if you received a mosaic of a large number of small files we are implicitly suggesting that the best option you have is to merge them into a single, larger, properly preprocessed file (and `gdal_merge` or `gdalbuildvrt` is your friend for this first step)."

I.e. as long as we don't work with huge data, we want to merge the tiffs to one:

```bash
FILE=out.tif
gdal_merge.py -n 0 -a_nodata 0 -o $FILE folder/*.tif 
```

I occasionally receive:
```bash
ERROR 3: 2016.tif: Free disk space available is 22795676418048 bytes, whereas 47927919677168 are at least necessary. You can disable this check by defining the CHECK_DISK_FREE_SPACE configuration option to FALSE.
```

I am not sure where this is coming from. GDAL must be estimating the filesize incorrectly. We can surpass the warning by turning off  `CHECK_DISK_FREE_SPACE`:

```bash
gdal_merge.py -n 0 -a_nodata 0 -o $FILE folder/*.tif --config CHECK_DISK_FREE_SPACE FALSE
```

### Non-RGB bands (e.g. IR Band)
Careful: the inputs have 4 bands. But we also have Photometric Interpretation: RGB color. 
This causes the "TIFFReadDirectory:Sum of Photometric type-related color channels and ExtraSamples doesn't match SamplesPerPixel. Defining non-color channels as ExtraSamples." warnings.

The extra band is not defined. We can change the tag to 'EXTRASAMPLE_UNSPECIFIED'. 
- [The ExtraSamples tag is tag 338](https://www.awaresystems.be/imaging/tiff/tifftags/extrasamples.html). 
- We set its value (position 1) to 0 (EXTRASAMPLE_UNSPECIFIED).

```bash
sudo apt install libtiff-tools
```

```bash
tiffset -s 338 1 0 $FILE
```

We can also set `-nosrcalpha` in gdalwarp


### Warp
We probably want to warp / reproject the TIFFs. Since those images are intended for webmapping (and Arc is requesting in 3857), we might as well project to Pseudo-Mercator.

```bash
gdalwarp $FILE ${FILE/.tif/_3857.tif} -t_srs EPSG:3857 -nosrcalpha
```

If we had to iterate over files:
```bash
for filename in folder/*.tif
do
    f=$(basename $filename)
    echo $f    
done
```

### Cut

```bash
gdalwarp ${FILE/.tif/_3857.tif} ${FILE/.tif/_3857_cut.tif} \
-cutline ../clip_area_V.gpkg \
-cl clip_area_V \
-crop_to_cutline \
-co COMPRESS=LZW \
-co BIGTIFF=YES \
-nosrcalpha
```

### Converting to COG

https://gdal.org/drivers/raster/cog.html

Without further adjustments, the following command will convert to COG. It creates the overviews AND the tiles. 
- The tile size defaults to 512x512. 
- Default for OVERVIEWS is set to auto, meaning that they will be generated if they did not exist in the inputs.
- If OVERVIEW_COUNT is not specified and OVERVIEWS are generated, the default number of overview levels is such that the dimensions of the smallest overview are smaller or equal to the BLOCKSIZE value (Blocksize being the tile size).

```bash
gdal_translate ${FILE/.tif/_3857.tif} ${FILE/.tif/_3857_cog.tif} \
-a_nodata 0 \
-of COG \
-co COMPRESS=LZW \
-co BIGTIFF=YES

gdal_translate ${FILE/.tif/_3857_cut.tif} ${FILE/.tif/_3857_cog_cut.tif} \
-a_nodata 0 \
-of COG \
-co COMPRESS=LZW \
-co BIGTIFF=YES
```

Cut and convert. Nodata is tricky. Need to set `srcnodata` and `dstnodata`.

```bash
gdalwarp ${FILE/.tif/_3857.tif} ${FILE/.tif/_3857_cog_cut.tif} \
-cutline ../clip_area_V.gpkg \
-cl clip_area_V \
-crop_to_cutline \
-co COMPRESS=LZW \
-co BIGTIFF=YES \
-srcnodata 0 \
-dstnodata 0 \
-nosrcalpha \
-of COG 
```

#### Multispectral data
WMS response will always be RGB/RGBA. However, we have imagery with 4 bands. So something will have to give.
Ideally, we'd like geoserver to query 3 bands at a time from the COG. I don't think that this is a thing though ([PlanarConfiguration](https://www.awaresystems.be/imaging/tiff/tifftags/planarconfiguration.html) is not a create option for COG).


So then we can either:

- Have the geoserver subset 3 bands at a time, which we can specify in the [rastersymbolizer](https://docs.geoserver.org/2.23.x/en/user/styling/sld/reference/rastersymbolizer.html). A bit unfortunate since we incur egress overhead (we grab 4 bands while we only need 3).
```xml
<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/sld
http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd" version="1.0.0">
  <NamedLayer>
    <Name>rgb</Name>
    <UserStyle>
      <Title>IRG using band 4,1,2</Title>
      <FeatureTypeStyle>
        <Rule>
          <RasterSymbolizer>
            <Opacity>1.0</Opacity>
            <ChannelSelection>
              <RedChannel>
                <SourceChannelName>4</SourceChannelName>
              </RedChannel>
              <GreenChannel>
                <SourceChannelName>1</SourceChannelName>
              </GreenChannel>
              <BlueChannel>
                <SourceChannelName>2</SourceChannelName>
              </BlueChannel>
            </ChannelSelection>
          </RasterSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
```

- Create COGs with 3 bands each; one with RGB and one with IRG. Also unfortunate since we incur storage overhead since we replicate the R and G band. We'd do this e.g. with.

```bash
gdal_translate ${FILE/.tif/_3857.tif} ${FILE/.tif/_rgb.tif} -a_nodata 0 -of COG -co COMPRESS=LZW -co BIGTIFF=YES -b 1 -b 2 -b 3
gdal_translate ${FILE/.tif/_3857.tif} ${FILE/.tif/_irg.tif} -a_nodata 0 -of COG -co COMPRESS=LZW -co BIGTIFF=YES -b 4 -b 1 -b 2
```

Flags:
- `BIGTIFF=YES`: can be more than 4 GB
- `COMPRESS`
- `a_nodata`: Value for nodata. 0 Is probably not a good idea!
- `-b -b -b` the bands to use as Photometric bands

#### Verify
Then we verify with `validate_cloud_optimized_geotiff.py`

```bash
python3 validate_cloud_optimized_geotiff.py ${FILE/.tif/_rgb.tif}
python3 validate_cloud_optimized_geotiff.py ${FILE/.tif/_irg.tif}
```

And we can verify with `tiffinfo`. We should see multiple TIFF directories, each being tiled.

We also could have generated the overviews first with `gdaladdo` and then tile with `gdal_translate` while copying the overviews. 
```bash
gdaladdo -r average input.tif 2 4 8 16 
gdal_translate -of COG -co TILED=YES -co COPY_SRC_OVERVIEWS=YES input.tif output.tif
```

## Upload to bucket (S3/ GCS)

### Google Cloud Storage (GCS)
#### create a bucket 
- name
- Region: choose same region as GCE 
- Class: Probably "standard", possibly "nearline". I went with "Autoclass" to see what google decides.
- Access control: Uniform
- No need for versioning/retention.
- Enforce public prevention on this bucket

Then, create [(HMAC) access key](https://cloud.google.com/storage/docs/authentication/hmackeys) for the bucket

#### upload COG into bucket
- Via web UI, or 
- Via CLI ([install](https://cloud.google.com/sdk/docs/install))


[Upload File](https://cloud.google.com/storage/docs/uploading-objects#upload-object-cli):
```bash
gcloud storage cp ${FILE/.tif/_3857_cog.tif} gs://usda_salt
gcloud storage cp ${FILE/.tif/_3857_cog_cut.tif} gs://usda_salt
```


### AWS S3

#### Set up bucket
1. Create a bucket on aws
1. Upload file into bucket
1. Leave "block public access"
1. Create S3 bucket access key ([howto on medium](https://medium.com/@shamnad.p.s/how-to-create-an-s3-bucket-and-aws-access-key-id-and-secret-access-key-for-accessing-it-5653b6e54337)). 

#### Upload
- Use web UI, or 
- install AWS CLI. [AWS quickstart guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-services-s3-commands.html).

Don't install `aws` from repo. Download and install from amazonaws.com instead:

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install --bin-dir /usr/local/bin --install-dir /usr/local/aws-cli --update
```

Configure aws cli to set access key
```bash
aws configure
```

Then upload via:
```bash
aws s3 cp ${FILE/.tif/_rgb.tif} s3://usdasalt/
aws s3 cp ${FILE/.tif/_irg.tif} s3://usdasalt/
```

## Add layer to QGIS

## Add Store+layer in geoserver

### From GCS
1. Public access:
    - cog://https://storage.googleapis.com + Range Header: HTTP
1. Private access. Broken as of 2023-08-09:
    - https://github.com/geosolutions-it/imageio-ext/issues/284#issuecomment-1597305185
    - https://osgeo-org.atlassian.net/browse/GEOS-11037
    - https://osgeo-org.atlassian.net/browse/GEOS-11028?jql=text%20~%20%22cog*%22%20ORDER%20BY%20created%20DESC

[Here a public COG in GCS for testing](https://storage.googleapis.com/gcp-public-data-landsat/LC08/01/044/034/LC08_L1GT_044034_20130330_20170310_01_T2/LC08_L1GT_044034_20130330_20170310_01_T2_B11.TIF).
We can add it with HTTP headers and no username/password.

### From AWS
Use S3 bucket access key as username+password
![](/images/cog/cog_store_aws.png)

## Add to arconline
- URL: https://necgeoserver.duckdns.org/geoserver/wms?authkey={authkey}
- can we pass the style? A full URL might look like:


https://natcapgeoserver.duckdns.org/geoserver/ventura/wms?authkey=a41de7ee-ae14-4ac9-bbcd-917a7ee50455&STYLES=IRG


https://natcapgeoserver.duckdns.org/geoserver/ventura/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&BBOX=34.18514551556391723,-119.0857379538306446,34.28688448006535339,-119.0111954036453028&CRS=EPSG:4326&WIDTH=479&HEIGHT=654&LAYERS=2010_3857_cog&STYLES=&FORMAT=image/png&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi:96&TRANSPARENT=TRUE

https://natcapgeoserver.duckdns.org/geoserver/ventura/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&BBOX=34.21217101480012701,-119.1014166800943883,34.31593500159418397,-118.9570456795782576&CRS=EPSG:4326&WIDTH=1487&HEIGHT=1069&LAYERS=2010_3857_cog&STYLES=IRG&FORMAT=image/png&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi:96&TRANSPARENT=TRUE



## Issues

- error `Unable to write data from S3 to the destination ByteBuffer.`
        - maybe too little memory on EC2 ins5tance
- error `Could not find a scanline extractor for PlanarImage`
	- We can only serve up 3 bands!
        - https://gis.stackexchange.com/questions/26993/serving-4-band-geotiff-in-geoserver-2-1-4
- error `java.io.IOException: Cannot buffer entire body for content length: xxx`
    - probably trying to load a large NON-COG tif!
    
    
When updating the TIF objects in GCS/S3, it seems like sometimes it is necessary to restart the geoserver.
