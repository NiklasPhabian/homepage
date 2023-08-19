---
title: Zero to Geoserver
description: How to setup geoserver on AWS
date: 2023-08-18
---


## EC2 considerations
We generally seem to be able run the geoserver on a t.micro instance, but run into crashes under load. Either the geoserver jave container runs out of memory, or the whole machine. t2.medium runs the geoserver very stable. But we might get away with t2.small


## Install geoserver
https://docs.geoserver.org/latest/en/user/installation/linux.html

```bash
sudo apt install openjdk-17-jre unzip

VERSION=2.23.2
USERNAME=griessbaum
wget https://sourceforge.net/projects/geoserver/files/GeoServer/$VERSION/geoserver-$VERSION-bin.zip

sudo mkdir /usr/share/geoserver
sudo mv geoserver-$VERSION-bin.zip /usr/share/geoserver/
cd /usr/share/geoserver/
sudo unzip geoserver-$VERSION-bin.zip 
sudo rm geoserver-$VERSION-bin.zip 
echo "export GEOSERVER_HOME=/usr/share/geoserver" >> ~/.profile
. ~/.profile
sudo chown -R $USERNAME /usr/share/geoserver/
```

### adapting to Java 17
https://docs.geoserver.org/latest/en/user/production/java.html#running-on-java-17

```bash
rm /usr/share/geoserver/webapps/geoserver/WEB-INF/lib/marlin-0.9.3.jar
```

### Startup
```bash
/usr/share/geoserver/bin/startup.sh
/usr/share/geoserver/bin/shutdown.sh
```

By default, starts up at localhost:8080 with
http://localhost:8080/geoserver/

usr: admin
pwd: geoserver

### Autostart
https://docs.geoserver.org/latest/en/user/production/linuxscript.html

```bash
wget https://docs.geoserver.org/latest/en/user/_downloads/5c56ec58bc153d3a7dd6ef198f9eeaf7/geoserver_deb
```

## Settings 
settings are in `/usr/share/geoserver/data_dir/global.xml`

### Open Firewall
```bash
sudo ufw enable
sudo ufw allow 22
sudo ufw allow 8080
sudo ufw allow 80
sudo ufw allow 443
sudo ufw status
```

[Edit security group on AWS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/authorizing-access-to-an-instance.html)


### Reverse Proxy / SSH / HTTPS

### Duckdns
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/geoserver
```

https://gis.stackexchange.com/questions/306824/geoserver-behind-nginx-web-admin-crashes

```
server {
        listen 80;
        server_name necgeoserver.duckdns.org www.necgeoserver.duckdns.org;
        return 301 https://necgeoserver.duckdns.org$request_uri;
}
```


```bash
sudo ln -s /etc/nginx/sites-available/geoserver /etc/nginx/sites-enabled
sudo nginx -t
sudo service nginx reload
sudo service nginx restart
```

### Get ssl
```bash
sudo apt update
sudo apt install python3-certbot-nginx
sudo certbot --nginx certonly
```

- Certificate is saved at: `/etc/letsencrypt/live/necgeoserver.duckdns.org/fullchain.pem`
- Key is saved at:         `/etc/letsencrypt/live/necgeoserver.duckdns.org/privkey.pem`

now add the certificate info
```bash
sudo nano /etc/nginx/sites-available/geoserver
```

```
server {        
        listen 443 ssl http2;
        listen [::]:443 ssl http2;

        ssl_certificate /etc/letsencrypt/live/necgeoserver.duckdns.org/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/necgeoserver.duckdns.org/privkey.pem;

        server_name necgeoserver.duckdns.org;

        location = /favicon.ico {
                access_log off;
                log_not_found off;}

        location / {
                proxy_pass http://127.0.0.1:8080/geoserver/;
                proxy_pass_header Set-Cookie;
                proxy_set_header Host $host;
                proxy_set_header X-Forwarded-Proto $scheme;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        location /geoserver/ {
                proxy_pass http://127.0.0.1:8080/geoserver/;
                proxy_pass_header Set-Cookie;
                proxy_set_header Host $host;
                proxy_set_header X-Forwarded-Proto $scheme;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Test again
```bash
sudo nginx -t
sudo service nginx reload
sudo service nginx restart
```

```bash
sudo crontab -e
17 7 * * * certbot renew --post-hook "systemctl reload nginx"
```

### Set proxy settings
We won't be able to log in via port 443. We have to temporarily open port 8080 (aws and local firewall) and change the configuration:

In the webinterface: Settings > Global > Proxy Base URL in the GeoServer 
- admin site: necgeoserver.duckdns.org
- `Use headers for Proxy URL.`= True

### Allow cross-site referencing
https://dev.to/iamtekson/using-nginx-to-put-geoserver-https-4204

```bash
sudo nano /usr/share/geoserver/webapps/geoserver/WEB-INF/web.xml
```

```xml
<context-param>
    <param-name>GEOSERVER_CSRF_WHITELIST</param-name>
    <param-value>necgeoserver.duckdns.org</param-value>
</context-param>  
<context-param>  
	<param-name>PROXY_BASE_URL</param-name>  
    <param-value>https://necgeoserver.duckdns.org/geoserver</param-value>  </context-param>
```

Note: If you screw this up, you can try to get back to the webinterface through port 8080

https://docs.geoserver.org/stable/en/user/security/webadmin/csrf.html

## Security/Production settings
Now that SSL is running, we can tighten up security

- Block Port 8080 
	- in security group 
	- firewall: `sudo ufw deny 8080`
- Update admin password (security->Users)
- update master pwd
https://docs.geoserver.org/latest/en/user/production/config.html

- We don't care about service limits since we won't allow unauthorized access
- We might want to disable the web admin IF


###  not allowing unauthorized requests to geoserver
- Do not Remove anonymous from Authentication settings
- Create new user: arconline/Cw4hUfib8aeqSM2
- Change layer security; 
        - by default nothing is ticked meaning everyone can do everything
        - tick "read" for ROLE_AUTHENTICATED. That should only allow authenticated users to access
        

## Fish/sftp
https://linuxize.com/post/using-the-ssh-config-file/
https://unix.stackexchange.com/questions/419778/kde-dolphin-will-not-connect-to-dropbear-ssh-server

```bash
nano .ssh/config

Host necgeoserver
    HostName necgeoserver.duckdns.org
    User ubuntu
    IdentityFile ~/Dropbox/naturalcapitalconsulting/niklas.pem

chmod 600 ~/.ssh/config
ssh necgeoserver
```


## Wipe the demo data
- data_dir/workspaces : wipe the dir 
```bash
rm -rf /usr/share/geoserver/data_dir/workspaces && mkdir data_dir/workspaces
sudo chown ubuntu data_dir/workspaces/
```

- data_dir/layergroups : wipe the dir 
```bash 
rm -rf /usr/share/geoserver/data_dir/layergroups/*
```
- while not stritcly necessary, wipe the data directory too: 
```bash
rm -rf /usr/share/geoserver/data_dir/data/*
```


## Setup PostGIS
```bash
sudo apt install postgis gdal-bin
sudo service postgresql status
sudo nano /etc/postgresql/14/main/postgresql.conf
listen_addresses = 'localhost' 
```
 
### Set up PgAdmin with ssh tunnel
 
```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS nec;"
sudo -u postgres psql -c "CREATE DATABASE nec owner=postgres;"
sudo -u postgres psql -d nec -c "CREATE EXTENSION postgis;"
sudo -u postgres psql -d nec -c "CREATE EXTENSION postgis_raster;"
sudo -u postgres psql -d nec -c "CREATE EXTENSION hstore;"
sudo -u postgres psql -d nec -c "GRANT CONNECT ON DATABASE nec TO nec_read;"
sudo -u postgres psql -d nec -c "ALTER DEFAULT PRIVILEGES GRANT SELECT ON TABLES TO nec_read;"
```
 

### Load to PostGIS
https://postgis.net/docs/using_raster_dataman.html

```bash
gdalinfo LC09_L1TP_041036_20230210_20230210_02_T1_refl.tif 
raster2pgsql -s  32611 -t 500x500 -I -C -M  *.tif  > out.sql
psql -h localhost -U postgres -d raster_test -f out.sql
sudo service postgresql restart
```

raster2pgsql flags:
- -s EPSG
- -t tiel size
- -I add index
- -C apply raster constraints
- -M Vacuum analyze the raster table.


### PGraster plugin
https://docs.geoserver.org/stable/en/user/community/pgraster/pgraster.html

```bash
sudo apt install libpostgresql-jdbc-java
wget https://build.geoserver.org/geoserver/2.22.x/community-latest/geoserver-2.22-SNAPSHOT-pgraster-plugin.zip
mv geoserver-2.22-SNAPSHOT-pgraster-plugin.zip /usr/share/geoserver/webapps/geoserver/WEB-INF/lib/
cd /usr/share/geoserver/webapps/geoserver/WEB-INF/lib/
unzip geoserver-2.22-SNAPSHOT-pgraster-plugin.zip
rm geoserver-2.22-SNAPSHOT-pgraster-plugin.zip
```

```
java -Xbootclasspath/a:<location of jdbc.jar> -jar <your_geoserver_install_dir>/webapps/geoserver/WEB-INF/lib/gt-imagemosaic-jdbc-{version}.jar import  -config <your geoserver data dir>/coverages/osm.postgis.xml -spatialTNPrefix tileosm -tileTNPrefix tileosm -dir tiles -ext png
```

## Install COG Plugin

install COG geoserver plugin
```bash
VERSION=2.23
wget https://build.geoserver.org/geoserver/$VERSION.x/community-latest/geoserver-$VERSION-SNAPSHOT-cog-plugin.zip

mv geoserver-$VERSION-SNAPSHOT-cog-plugin.zip /usr/share/geoserver/webapps/geoserver/WEB-INF/lib/

unzip geoserver-$VERSION-SNAPSHOT-cog-plugin.zip 
```

Verify by heading to stores-> add store -> Geotiff; you now should have "Cloud Optimized GeoTIFF (COG)" Checkbox

## Install authkey plugin
The `authkey` module for GeoServer allows for a very simple authentication protocol designed for OGC clients that cannot handle any kind of security protocol, not even the HTTP basic authentication.

- https://docs.geoserver.org/latest/en/user/extensions/authkey/index.html
- download from here: https://geoserver.org/release/stable/

```bash
VERSION=2.23.0
wget https://sourceforge.net/projects/geoserver/files/GeoServer/$VERSION/extensions/geoserver-$VERSION-authkey-plugin.zip
mv geoserver-$VERSION-authkey-plugin.zip /usr/share/geoserver/webapps/geoserver/WEB-INF/lib/
cd /usr/share/geoserver/webapps/geoserver/WEB-INF/lib/
unzip geoserver-$VERSION-authkey-plugin.zip
rm geoserver-$VERSION-authkey-plugin.zip
```

Then follow https://docs.geoserver.org/latest/en/user/extensions/authkey/index.html#configuration

- Add a new authentication filter
	- Name: whatever
	- name of url parameter: authkey
	- AUth key to user mapper: user property
	- User/group service: default.
- Syn the user/group services
- save

After configuring the filter it is necessary to put this filter on the authentication filter chain(s).

- i.e. add a filter chain. 
	- Name: `key_pwd`
	- ANT patterns: `/wms/**,/ows/**`
	- Add both the `authkey` and `basic` chain filter
	- Make it second to the last (bottom); before default

![i](/images/filter_chain.png)

## Allow CORS
We might want to allow CORS for acronline to use user/pwd login

- https://docs.geoserver.org/latest/en/user/production/container.html#enable-cors
- https://www.geosolutionsgroup.com/news/gs-secured-with-agol/


`sudo nano /usr/share/geoserver/webapps/geoserver/WEB-INF/web.xml`

## Limit Memory 

https://docs.geoserver.org/latest/en/user/production/container.html

-XX:+UseParallelGC
-Xmx256M
-Xmx384M

