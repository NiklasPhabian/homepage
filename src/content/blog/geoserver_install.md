---
title: Zero to Geoserver
description: How to setup geoserver on AWS
date: 2023-08-18
---


## EC2 considerations
We generally seem to be able run the geoserver on a t.micro instance, but run into crashes under load. Either the geoserver java container runs out of memory, or the whole machine. t2.medium runs the geoserver very stable. But we might get away with t2.small.

- While creating, we can already allow for HTTP and HTTPS traffic.
- [Here a short list of things I do when setting up a VPS](blog/vps).


## Install geoserver
- https://geoserver.org/
- https://docs.geoserver.org/latest/en/user/installation/linux.html

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

### Adapting to Java 17
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

- user: admin
- pwd: geoserver

### Autostart / Run as Service
https://docs.geoserver.org/latest/en/user/production/linuxscript.html

```bash
wget https://docs.geoserver.org/latest/en/user/_downloads/5c56ec58bc153d3a7dd6ef198f9eeaf7/geoserver_deb
mv geoserver_deb geoserver
sudo mv geoserver /etc/init.d/
chmod +x /etc/init.d/geoserver
```

Now we should be able to e.g.:
```bash
sudo /etc/init.d/geoserver start
sudo service geoserver status
```

We can either edit the `/etc/init.d/geoserver`, or create `/etc/default/geoserver`.


```bash
sudo nano /etc/init.d/geoserver
```

- `GEOSERVER_HOME=/usr/share/geoserver`
- `GEOSERVER_DATA_DIR=/usr/share/geoserver/data_dir`
- `USER=griessbaum` (that's probably not a good idea)
- `JAVA_HOME=''` (my java lives in `/bin/java`)

```bash
sudo systemctl daemon-reload
sudo service geoserver restart
```

To make the service start at startup: 
```bash
sudo systemctl enable geoserver
```



### Open Firewall
If we are in production, we probably only need 443 **and 22**. Don't forget 22 LOL. 
If the machine is on-premise, maybe we open 8080 or 80?


```bash
sudo ufw enable
sudo ufw allow 443
sudo ufw allow 22
sudo ufw status
```


[Edit security group on AWS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/authorizing-access-to-an-instance.html)


### Wipe the demo data
- data_dir/workspaces : wipe the dir 

```bash
rm -rf /usr/share/geoserver/data_dir/workspaces && mkdir /usr/share/geoserver/data_dir/workspaces
sudo chown ubuntu /usr/share/geoserver/data_dir/workspaces/
```

- data_dir/layergroups : wipe the dir 

```bash 
rm -rf /usr/share/geoserver/data_dir/layergroups/*
```

- while not stritcly necessary, wipe the data directory too: 
    
```bash
rm -rf /usr/share/geoserver/data_dir/data/*
```

## Reverse Proxy, SSL/HTTPS

### Install nginx
- https://gis.stackexchange.com/questions/306824/geoserver-behind-nginx-web-admin-crashes

```bash
ADDRESS='natcapgeoserver.duckdns.org'
sudo apt install nginx
```

Now let's add an available site to test things out on port 80. 

```bash
sudo nano /etc/nginx/sites-available/geoserver

server {
        listen 80;
        server_name natcapgeoserver.duckdns.org www.natcapgeoserver.duckdns.org;
}
```



Adding the site as an enabled site
```bash
sudo ln -s /etc/nginx/sites-available/geoserver /etc/nginx/sites-enabled
sudo nginx -t
sudo service nginx reload
sudo service nginx restart
```

Site should now be available at https://natcapgeoserver.duckdns.org. 

### Get SSL certificate
```bash
sudo apt install python3-certbot-nginx
sudo certbot --nginx certonly
```

- Certificate is saved at: `/etc/letsencrypt/live/$ADDRESS/fullchain.pem`
- Key is saved at:         `/etc/letsencrypt/live/$ADDRESS.duckdns.org/privkey.pem`

now add the certificate info
```bash
sudo nano /etc/nginx/sites-available/geoserver
```

### Update nginx

```
server {
        listen 80;
        server_name natcapgeoserver.duckdns.org www.natcapgeoserver.duckdns.org;
        return 301 https://natcapgeoserver.duckdns.org$request_uri;
}

server {        
        listen 443 ssl http2;
        listen [::]:443 ssl http2;

        ssl_certificate /etc/letsencrypt/live/natcapgeoserver.duckdns.org/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/natcapgeoserver.duckdns.org/privkey.pem;

        server_name natcapgeoserver.duckdns.org;

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

At this point, you should either get to the geoserver (if it is running), or get a 502 bad gateway if it is off.

And have the cert renewed once a week.

```bash
sudo crontab -e
17 7 * * * certbot renew --post-hook "systemctl reload nginx"
```

## Geoserver Settings 
settings are in `/usr/share/geoserver/data_dir/global.xml`

### Set proxy settings
We won't be able to log in via port 443. We have to change the server's proxy settings first. Kind of a hen-and-egg problem ..

Two solutions: 
- temporarily open port 8080 (aws and local firewall). Not very elegant.
- [port forwarding](blog/ssh_tunnel); e.g. 
```bash 
ssh -N -L 1234:127.0.0.1:8080 natcapgeoserver.duckdns.org
```
 Then navigate to `localhost:1234`.

Once logged into the webinterface (`admin`/`geoserver`), go to  `Global` (under `Settings`) 
- Set `Proxy Base URL` to your address (`natcapgeoserver.duckdns.org`). In previous versions, this might have been called `admin site`.
- Tick/set `Use headers for Proxy URL` = True.

### Allow cross-site referencing
https://dev.to/iamtekson/using-nginx-to-put-geoserver-https-4204

```bash
sudo nano /usr/share/geoserver/webapps/geoserver/WEB-INF/web.xml
```

Add the following

```xml
<context-param>
        <param-name>GEOSERVER_CSRF_WHITELIST</param-name>
        <param-value>natcapgeoserver.duckdns.org</param-value>
</context-param> 
```
and edit the following
```xml
<context-param>  
        <param-name>PROXY_BASE_URL</param-name>  
        <param-value>https://natcapgeoserver.duckdns.org/geoserver</param-value>
</context-param>
```

Note: If you screw this up, you can try to get back to the webinterface through port 8080

https://docs.geoserver.org/stable/en/user/security/webadmin/csrf.html

## Security/Production settings
https://docs.geoserver.org/latest/en/user/production/config.html

Now that SSL is running, we can tighten up security

- Block Port 8080
    - in security group 
    - firewall: `sudo ufw deny 8080`
- Update admin password (`Security` > `Users`)
- Update master pwd (`Security` > `Passwords`)
- We don't care about service limits since we won't allow unauthorized access
- We might want to disable the web admin IF

## Not allowing unauthorized requests to geoserver
- Do not Remove anonymous from Authentication settings
- Create new user (e.g. `arconline`)
- Change layer security; 
    - by default nothing is ticked meaning everyone can do everything
    - tick "read" for ROLE_AUTHENTICATED. That should only allow authenticated users to access
  
## Plugins

### PGraster geoserver plugin
https://docs.geoserver.org/stable/en/user/community/pgraster/pgraster.html

```bash
VERSION=2.23
sudo apt install libpostgresql-jdbc-java
wget https://build.geoserver.org/geoserver/$VERSION.x/community-latest/geoserver-$VERSION-SNAPSHOT-pgraster-plugin.zip
mv geoserver-$VERSION-SNAPSHOT-pgraster-plugin.zip /usr/share/geoserver/webapps/geoserver/WEB-INF/lib/
cd /usr/share/geoserver/webapps/geoserver/WEB-INF/lib/
unzip geoserver-$VERSION-SNAPSHOT-pgraster-plugin.zip
rm geoserver-$VERSION-SNAPSHOT-pgraster-plugin.zip
```

This does not work out-of-the-box for me. We have to do something with imagemosaic first. I never figured it out.

```bash
java -Xbootclasspath/a:<location of jdbc.jar> -jar <your_geoserver_install_dir>/webapps/geoserver/WEB-INF/lib/gt-imagemosaic-jdbc-{version}.jar import -config <your geoserver data dir>/coverages/osm.postgis.xml -spatialTNPrefix tileosm -tileTNPrefix tileosm -dir tiles -ext png
```

Remove:
```bash
rm /usr/share/geoserver/webapps/geoserver/WEB-INF/lib/gs-pgraster-2.23-SNAPSHOT.jar
```


### Install COG geoserver plugin

```bash
VERSION=2.23
wget https://build.geoserver.org/geoserver/$VERSION.x/community-latest/geoserver-$VERSION-SNAPSHOT-cog-plugin.zip
mv geoserver-$VERSION-SNAPSHOT-cog-plugin.zip /usr/share/geoserver/webapps/geoserver/WEB-INF/lib/
cd /usr/share/geoserver/webapps/geoserver/WEB-INF/lib/
unzip geoserver-$VERSION-SNAPSHOT-cog-plugin.zip 
rm geoserver-$VERSION-SNAPSHOT-cog-plugin.zip 
```

Restart. Verify by heading to `stores` > `add store` > `Geotiff`; you now should have "Cloud Optimized GeoTIFF (COG)" Checkbox

### Install authkey plugin
The `authkey` module for GeoServer allows for a very simple authentication protocol designed for OGC clients that cannot handle any kind of security protocol, not even the HTTP basic authentication ... like ArcOnline!

- https://docs.geoserver.org/latest/en/user/extensions/authkey/index.html
- download from here: https://geoserver.org/release/stable/

```bash
VERSION=2.23.2
wget https://sourceforge.net/projects/geoserver/files/GeoServer/$VERSION/extensions/geoserver-$VERSION-authkey-plugin.zip
mv geoserver-$VERSION-authkey-plugin.zip /usr/share/geoserver/webapps/geoserver/WEB-INF/lib/
cd /usr/share/geoserver/webapps/geoserver/WEB-INF/lib/
unzip geoserver-$VERSION-authkey-plugin.zip
rm geoserver-$VERSION-authkey-plugin.zip
```

Then follow https://docs.geoserver.org/latest/en/user/extensions/authkey/index.html#configuration

Now add a new authentication filter
1. Go to `Security` > `Authentication` > Under `Authentication Filters`, click `Add new`
1. Click `Authkey` up top
1. set:
    1. `Name`: `whatever`
    1. `name of url parameter`: `authkey`
    1. `Auth key to user mapper`: `user property`
    1. `User/group service`: `default`
1. Sync the user/group services
1. save

After configuring the filter, it is necessary to put this filter on the authentication filter chain(s).  i.e. add a filter chain. 
1. Go to `Security` > `Authentication` > Under `Filters Chains`, click `Add service chain`.
1. Set:
    - Name: `key_pwd`
	- `Comma delimited list of ANT patterns (with optional query string)`: `/wms/**,/ows/**`
	- Add both the `authkey` and `basic` chain filter
1. Make it second to the last (bottom); before default

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

