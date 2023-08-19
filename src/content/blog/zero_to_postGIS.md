---
external: false
draft: false
title: Zero-To-PostGIS for OSM data
description: How to setup a PostGIS server to host and serve OpenStreetMap Data
date: 2019-08-21
---

These are some notes I wrote for a colleague to setup a postgis server to store some OSM data.
 

## Get yourself a Linux server

Several options:
- Get your hands on a discarded workstation; 8 GB of ram should suffice. Invest 50 USD into a new 1 TB drive. If you have the extra money, spend 200 on a high-end SSD. Install linux on the machine. (e.g. Ubuntu (LTS) server).
- Ask our sysamdin for a virtual server. If you have the money, buy a high-end SSD drive and have the sysadmin mount the drive from your virtual server.
- Rent a VPS from amazon, google, azure etc. Note that this might become expensive really quickly.


## Install Postgres
On e.g. Ubuntu 22.04

```bash
sudo apt install postgresql-14 postgresql-14-postgis-3
```

## Configure 

### postgres.conf
edit

```bash
/etc/postgresql/10/main/postgresql.conf 
```

Things to edit
1. `listen_addresses = '*' `
2. Performance according to [pgtune](https://pgtune.leopard.in.ua); Set the DB Type to Data Warehouse

### pg_hba.conf
Edit `/etc/postgresql/10/main/pg_hba.conf` to allow for local pwd-authenticated connections. e.g. entries like

```bash
host        all all     128.111.61.0/24     md5
host		all	all		192.168.0.0/16		md5
host		all	all		128.111.111.0/24	md5
host		all	all		128.111.110.0/24	md5
host        all all     128.111.61.0/24     md5
```

## Setup tablespaces (optional)
On your own hardware, it might be useful to let the tablespace live on a faster disk and have the index and flatnodes live 
in a dedicated location.

In this example, we had an SSD mounted to `/db`. If you were on a VPC, you could e.g. [add new disks](add_disks).



```bash
OSMBASE=/db/osm
```

Then create folders
```bash
sudo mkdir -p $OSMBASE/data/
sudo mkdir -p $OSMBASE/index/	
sudo mkdir -p $OSMBASE/flatnodes/	
```

And give postgres user access to folders
```bash
sudo chown postgres $OSMBASE/index
sudo chown postgres $OSMBASE/data    
sudo chown postgres $OSMBASE/flatnodes 
sudo -u postgres touch $OSMBASE/flatnodes/flat_nodes.bin
```

Then add the tablespaces (here one for the indices and one for the data)
```bash
sudo -u postgres psql -c "DROP TABLESPACE IF EXISTS osmidx;"
sudo -u postgres psql -c "DROP TABLESPACE IF EXISTS osm;"
sudo -u postgres psql -c "CREATE TABLESPACE osmidx LOCATION '$OSMBASE/index';"
sudo -u postgres psql -c "CREATE TABLESPACE osm LOCATION '$OSMBASE/data';"
```


## Some basic psql commands
- See schema+index `\d $TABLE`
- See space consumption `\l+ $DB`
- Get runtimes `\timing on`
- Get users `\du`


## Create Groups + Users
```bash
sudo su - postgres
createuser --interactive --pwprompt
GRANT permissions ON DATABASE dbname TO username;
```



## Set postgres pwd
https://help.ubuntu.com/community/PostgreSQL

```bash
sudo -u postgres psql
```

```psql
\password postgres
```


## Setup database
- Create a database with `postgis` and `hstore` extensions.
- Create some users and maybe a `osm_write` and `osm_read` group

```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS osm;"
sudo -u postgres psql -c "CREATE DATABASE osm owner=postgres tablespace=osm ;" # setting the tablespace is optional
sudo -u postgres psql -d osm -c "CREATE EXTENSION postgis;"
sudo -u postgres psql -d osm -c "CREATE EXTENSION hstore;"
sudo -u postgres psql -d osm -c "GRANT CONNECT ON DATABASE osm TO osm_read;"
sudo -u postgres psql -d osm -c "ALTER DEFAULT PRIVILEGES GRANT SELECT ON TABLES TO osm_read;"
```

## Download the data
Get a subsetted pgf database dump from e.g. https://download.geofabrik.de/.

```bash
wget https://download.geofabrik.de/north-america/us-latest.osm.pbf
```

## Install osm2pgsql
```bash
sudo apt install osm2pgsql
```

## Load the pgf
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

the cache and number-processes will have to be adjusted according to the server. More information [here](load_pbf).

