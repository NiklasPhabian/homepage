---
title: Geoserver using Docker behind nginx
description: How to setup geoserver on AWS
date: 2025-01-18
---

# Premise/scenario
We are setting up a geoserver using a docker container on-premise without a domain name.

Key things I stumbled on:
- Set Proxy base url: https://$IP/geoserver/
- Tick "Use headers for Proxy URL".
- We need port 80 to be open and 301 redirect all http requests to https (`return 301 https://$host$request_uri;`)
- We need to mount/overwrite the `web.xml` to configure CSRF. [The Kartoza geoserver](https://github.com/kartoza/docker-geoserver) image seems to solve this a bit more elegantly with environment variables.

## Create SSL certificates:
```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/nginx-selfsigned.key \
    -out /etc/ssl/certs/nginx-selfsigned.crt
```
Fill out the certificate details (most fields can be skipped by pressing Enter). Use the server's IP address for the "Common Name" field.


```bash
sudo openssl dhparam -out /etc/nginx/dhparam.pem 2048
```

```bash
sudo tee /etc/nginx/snippets/self-signed.conf <<EOF
ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
EOF
```

```bash
sudo tee /etc/nginx/snippets/ssl-params.conf <<EOF
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_dhparam /etc/nginx/dhparam.pem;
ssl_ciphers "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384";
ssl_session_timeout 10m;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;
ssl_stapling off; # Not applicable without a domain
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
EOF
```

## Configure nginx
edit `/etc/nginx/sites-enabled/geoserver`

```conf
server {
    listen 80;
    server_name _;
    # Forward http requests to https. Relevant with geoserver since it generates http urls
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name _; # Matches any request, useful for IP-based access
    include snippets/self-signed.conf; # Use this line if using a self-signed certificate
    include snippets/ssl-params.conf; # Optional, but recommended

    location /geoserver {
                proxy_pass http://127.0.0.1:8080/geoserver;
                proxy_pass_header Set-Cookie;
                proxy_set_header Host $host;
                proxy_set_header X-Forwarded-Proto $scheme;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```


## Configure CSRF
Grab a `web.xml` and move it somewhere appropriate

```bash
wget https://github.com/geoserver/geoserver/blob/main/src/web/app/src/main/webapp/WEB-INF/web.xml
mv web.xml /data/web.xml
nano /data/web.xml
```

Add/edit:
```xml
    <context-param>
      <param-name>PROXY_BASE_URL</param-name>
      <param-value>https://$IP/geoserver</param-value>
    </context-param>

    <context-param>
        <param-name>GEOSERVER_CSRF_WHITELIST</param-name>
        <param-value>$IP</param-value>
    </context-param>
```

## Run the container:
Note: It seems like version 2.25.4 through 2.26.1 do NOT work with the netCDF plugin. 2.25.3 is the latest one that does as of 2025-01-18.

```bash
VERSION=2.25.3
DATADIR='/data/'

sudo docker run -it -p 8080:8080 \
        --mount type=bind,src=$DATADIR,target=/opt/geoserver_data \
        --volume /data/web.xml:/opt/config_overrides/web.xml \
        --env SKIP_DEMO_DATA=true \
        --env CORS_ENABLED=true \
        --env INSTALL_EXTENSIONS=true \
        --env STABLE_EXTENSIONS="netcdf" \
        docker.osgeo.org/geoserver:$VERSION
```
