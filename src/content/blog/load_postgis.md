---
title: Loading rasters/vector/pbf to postgis
description: Loading Raster and Vector Data to PostGIS
date: 2022-05-28
tags: gis, postgis
---

## Vector


## Raster
https://postgis.net/docs/using_raster_dataman.html

```bash
sudo -u postgres psql -d nec -c "CREATE EXTENSION postgis_raster;"
sudo apt install postgis gdal-bin
gdalinfo LC09_L1TP_041036_20230210_20230210_02_T1_refl.tif 
raster2pgsql -s  32611 -t 500x500 -I -C -M  *.tif  > out.sql
psql -h localhost -U postgres -d raster_test -f out.sql
```

raster2pgsql flags:
- -s EPSG
- -t tiel size
- -I add index
- -C apply raster constraints
- -M Vacuum analyze the raster table.



## PBF (OSM)
More information [here](load_pbf).

Get a subsetted pgf database dump from e.g. https://download.geofabrik.de/.

```bash
wget https://download.geofabrik.de/north-america/us-latest.osm.pbf
```

```bash
sudo apt install osm2pgsql
```

```bash
sudo -u postgres env "PATH=$PATH" osm2pgsql \
        --create \
        --database osm \
        --input-reader pbf \        
        --slim \
        --cache 3000 \
        --number-processes 4 \
        --disable-parallel-indexing \
        --drop \
        us-latest.osm.pbf
```

the cache and number-processes will have to be adjusted according to the server. 

 
