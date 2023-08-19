---
external: false
draft: false
title: Importing OSM PGF to PostGIS
description: pg
date: 2019-08-21
---

A guide on how to load a PGF OSM dump (e.g. from [geofabrik](https://www.geofabrik.de/) or [planet.openstreetmap.org](https://planet.openstreetmap.org/) to a PostGIS database:


## Steps
- **Parsing**: HDD bound. Node import is not affected by chace size. However, Way + Relation import become increasingly HDD bound with decreased cache. If sufficienct cache is available, process is CPU bound by postgres COPY operation. Otherwise appears to be HDD bound.
- **Going over pending ways**: CPU bound
- **Indexing**: Seems mostly HDD bound. There appears to be a speedup when disable-parallel-indexing is invoked. Probably due to less RAM and HDD congestion.
- **Closing tables**: Irrelevant if slim tables are dropped after import.


## osm2psql flags/settings
- `--cache`: In contrary to what some of the guides describe, the value specified by `--cache` is the total amount of cache used by the osm2psql; not the amount per process. The value can therefore be set to almost the full available RAM. 
- `--number-processes`: set to the number of available cores 
- `--unlogged`: may corrupt db at crash during write.
- `--drop`: Eliminates time for closing tables
- `--disable-parallel-indexing`: Disk appears to be major bottleneck during this step. Therefore it might be wise to disable parrallel indexing to make the process more CPU/RAM bound. By default osm2pgsql initiates the index building on all tables in parallel to increase performance. This can be disadvantageous on slow disks, or if you don't have enough RAM for PostgreSQL to perform up to 7 parallel index building processes (e.g. because `maintenance_work_mem` is set high).

## postgres.conf setting
Take the settings from https://pgtune.leopard.in.ua; a few comments

- `shared_buffers = 4GB`: approx 1/4 of mem
- `work_mem = 50MB`: Used for sorts
- `maintenance_work_mem = 2GB`: Used to create index
- `max_wal_size = 8GB`: (3*`checkpoint_segments`) * 16 MB
- `effective_io_concurrency = 1`: approx number of disks in RAID
- `synchronous_commit = off`
- `full_page_writes = off `
- `fsync = off`: only during import; turn back on after
- `autovacuum = off`: only during import; turn back on after
- `checkpoint_completion_target = 0.9`
- `effective_cache_size = 12GB`: approx 1/2 of mem ... probably using `total memory` - `shared_buffers`
- `max_worker_processes = 4`: Looked like idle workers take mem


## Import script

```bash
$$ load_region.sh

# Getting input url
if [ "$1" != "" ]; then
    URL=$1
else
    echo "No URL specified"
    read -p 'url to be loaded from: ' URL
fi


EXTENTION=${URL##*.}

if [ "$EXTENTION" = "pbf" ]; then
        echo "good file extention"
else
        echo "bad file extention"
        exit 1
fi

FILENAME=$(echo $URL | rev | cut -d '/' -f 1 | rev)
REGION=$(echo $FILENAME | sed 's/-latest.osm.pbf//' | sed 's/-//')

# Printing target time
echo "importing $REGION"
now=$(date --rfc-3339=seconds)
echo "starting time: $now"

# Checking if file has already been downloaded
if [ -f "$FILENAME" ]; then
        echo $FILENAME 'already downloaded'
else
        wget $URL
fi

# (Re-) creating database with extentions
sudo -u postgres psql -c "DROP DATABASE IF EXISTS osm$REGION";
sudo -u postgres psql -c "DROP TABLESPACE IF EXISTS osm$REGION";
sudo rm -r /db/osm$REGION
sudo mkdir /db/osm$REGION
sudo mkdir /db/osm$REGION/flatnodes
sudo chown -R postgres /db/osm$REGION/ 
sudo -u postgres psql -c "CREATE TABLESPACE osm$REGION LOCATION '/db/osm$REGION/' "
sudo -u postgres psql -c "CREATE DATABASE osm$REGION tablespace=osm$REGION owner=postgres";
sudo -u postgres psql -d osm$REGION -c "CREATE EXTENSION postgis;"
sudo -u postgres psql -d osm$REGION -c "CREATE EXTENSION hstore;"
sudo -u postgres psql -d osm$REGION -c "GRANT CONNECT ON DATABASE osm$REGION TO osm_r;"
sudo -u postgres psql -d osm$REGION -c "ALTER DEFAULT PRIVILEGES GRANT SELECT ON TABLES TO osm_r;"

# Importing
sudo -u postgres env "PATH=$PATH" osm2pgsql \
        --create \
        --database osm$REGION \
        --input-reader pbf \
        --tablespace-main-index osm$REGION \
        --tablespace-slim-data osm$REGION \
        --tablespace-slim-index osm$REGION \
        --slim \
        --cache 3000 \
        --number-processes 4 \
        --disable-parallel-indexing \
        --drop \
        --flat-nodes /db/osm$REGION/flatnodes/flatnodes.bin \
        $FILENAME 2>&1 | tee log/$REGION.log

./analyze_log.sh log/$REGION.log
```

The last line runs a script to analyze the log that osm2pgsql created:

```bash
$$./analyze_log.sh

# Getting input url
if [ "$1" != "" ]; then
    LOGFILE=$1
else
    echo "No LOGFILE specified"
    exit 1
fi


# Grabbing statistcs
NNODE=$(( $(grep 'Node stats: ' $LOGFILE | awk -F 'total' '{print $2}' | cut -d ')' -f1 | sed 's/(//') / 1000))
NWAY=$(( $(grep 'Way stats: ' $LOGFILE | awk -F 'total' '{print $2}' | cut -d ')' -f1 | sed 's/(//') / 1000))
NREL=$(( $(grep 'Relation stats: ' $LOGFILE | awk -F 'total' '{print $2}' | cut -d ')' -f1 | sed 's/(//') / 1000))
NPROC=$(( $(grep 'Finished processing ' $LOGFILE | grep 'way' | cut -d ' ' -f 3) / 1000))

TNODE=$(grep 'Node stats: ' $LOGFILE | awk -F 'in ' '{print $2}' | sed 's/s//' )
TWAY=$(grep 'Way stats: ' $LOGFILE | awk -F 'in ' '{print $2}' | sed 's/s//'  )
TREL=$(grep 'Relation stats: ' $LOGFILE | awk -F 'in ' '{print $2}' | sed 's/s//'  )

TPARSE=$(grep ' stats: ' $LOGFILE | awk -F 'in ' '{print $2}' | sed 's/s//' | paste -s -d+ | bc )
TPROC=$(grep 'Finished processing ' $LOGFILE | grep 'way' | awk -F 'in ' '{print $2}' | sed 's/sec//' | paste -s -d+ | bc )
#TPROC=$(grep 'Finished processing ' $LOGFILE | grep ' ways'| awk -F 'in ' '{print $2}' | sed 's/s//' | paste -s -d+ | bc)
TINDEX=$(grep 'All indexes' $LOGFILE | awk -F 'in ' '{print $2}' | sed 's/s//' | paste -s -d+ | bc)
TTABLE=$(grep 'Stopped table:' $LOGFILE | awk -F 'in ' '{print $2}' | sed 's/s//' | paste -s -d+ | bc)

# Printing statistics
echo -e 'n Nodes: \t' $NNODE ' k'
echo -e 'n Ways: \t' $NWAY ' k'
echo -e 'n Rels: \t' $NREL ' k'
echo -e 'n Proc: \t' $NPROC ' k'
echo ''

echo -e 'Nodes: \t\t' $TNODE ' sec'
echo -e 'Ways: \t\t' $TWAY ' sec'
echo -e 'Rels: \t\t' $TREL ' sec'
echo ''

#echo -e 'Parsing: \t' $TPARSE ' sec'
echo -e 'Proc ways: \t' $TPROC ' sec'
echo -e 'Indexing: \t' $TINDEX ' sec'
#echo -e 'Closing: \t' $TTABLE ' sec'

now=$(date --rfc-3339=seconds)
echo "ending time: $now"
```




