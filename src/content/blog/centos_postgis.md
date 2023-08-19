---
external: false
draft: false
title: Install Postgis on CentOS
description: pg
date: 2017-01-17
---

A few instructions on how to install PostGIS on CentOS 7


## Sources
- [https://yum.postgresql.org/repopackages.php](https://yum.postgresql.org/repopackages.php)
- [https://wiki.postgresql.org/wiki/YUM_Installation](https://wiki.postgresql.org/wiki/YUM_Installation)

## Install packages
```bash
sudo yum install postgresql10-server
sudo yum install postgresql10-contri
sudo yum install bc htop atop screen
sudo yum install postgis25_10
sudo yum install postgis25_10-client
```

## Installing osm2psql

```bash
sudo yum install osm2pgsql 
```

This failed due to conflict with geos ... so build from source [github](https://github.com/openstreetmap/osm2pgsql) instead.


```bash
sudo yum install git
git clone git://github.com/openstreetmap/osm2pgsql.git
sudo yum install cmake make gcc-c++ boost-devel expat-devel zlib-devel bzip2-devel postgresql-devel proj-devel proj-epsg lua-devel
cd osm2pgsql
mkdir build && cd build
cmake ..
make
sudo make install
```

## Issues 
```bash
ERROR:  could not load library "/usr/pgsql-10/lib/postgis-2.5.so": /usr/pgsql-10/lib/postgis-2.5.so: undefined symbol: GEOSFrechetDistanceDensify
```

In my case 'yum remove geos36' solved it.



## Initialize PGDATA

```bash
sudo /usr/pgsql-10/bin/postgresql-10-setup initdb
```


## Autostart
```bash
sudo systemctl enable postgresql-10.service
```

## Manual Start
```bash
service postgresql-10 start
```

## Test Install
```bash
sudo -u postgres psql
```


## Configure
On centos, 
- `postgresql.conf` lives at `/var/lib/pgsql/10/data/postgresql.conf`
- `pg_hba.conf` lives at `pg_hba.conf/var/lib/pgsql/10/data/pg_hba.conf`
