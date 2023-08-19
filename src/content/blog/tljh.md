---
external: false
title: The Littlest JupyterHub
description: Notes on setting up TLJH
date: 2022-05-04
--- 
 

## Install TLJH

https://tljh.jupyter.org/en/latest/install/custom-server.html

    sudo apt install python3 python3-dev git curl    
    curl -L https://tljh.jupyter.org/bootstrap.py | sudo -E python3 - --admin <admin-user-name>


## Configure TLJH
https://tljh.jupyter.org/en/latest/topic/tljh-config.html

    sudo tljh-config set http.port 8888
    sudo tljh-config reload proxy
    

## Configure TRAEFIK
Make traefik only listen to localhost

```bash
sudo nano /opt/tljh/state/traefik.toml
```

```config
[entryPoints.http]
address = "127.0.0.1:8000" 
```

https://github.com/jupyterhub/the-littlest-jupyterhub/issues/446
 

## Setup NGINX

### Getting SSL
[tljh](https://tljh.jupyter.org/en/latest/howto/admin/https.html)

```bash
sudo apt install certbot
sudo mkdir /etc/mycerts
sudo tljh-config set https.enabled true
```

We set https to port 8888 since we want nginx to take port 443
```bash
sudo tljh-config set http.port 8080
sudo tljh-config set https.port 8888
```


### If we have external certs:

```bash
sudo cp postgis_bren_ucsb_edu.key /etc/mycerts/
sudo cp postgis_bren_ucsb_edu_cert.cer /etc/mycerts/
sudo tljh-config set https.tls.key /etc/mycerts/postgis_bren_ucsb_edu.key
sudo tljh-config set https.tls.cert /etc/mycerts/postgis_bren_ucsb_edu_cert.cer
```

### If we get certs from letsencrypt

```bash 
sudo apt install python3-certbot-nginx
```

```bash
sudo tljh-config set https.letsencrypt.email griessbaum@gmail.com
sudo tljh-config add-item https.letsencrypt.domains poststare.duckdns.org
sudo tljh-config show
```

### If port 80 is closed we do DNS challenge
[Redit post](https://www.reddit.com/r/letsencrypt/comments/65ravi/duckdnsorg_now_supports_txt_records/)

```bash
sudo certbot certonly -a manual -d holyromanpv.duckdns.org --email griessbaum@gmail.com --preferred-challenges dns 
```

Examples:
```
TOKEN='13826710-5e84-4d9c-a3d0-023557bc5bd0'
CHALLENGE='w5Xk_72skfyli-R3NqOh0akMKvXXkKk-IjCnUiSPc1E'
DOMAIN='holyromanpv.duckdns.org'
```

```
curl "https://www.duckdns.org/update?domains=$DOMAIN&token=$TOKEN&txt=$CHALLENGE"
echo "https://www.duckdns.org/update?domains=$DOMAIN&token=$TOKEN&txt=$CHALLENGE"
```


###  Reload the proxy
```bash
sudo tljh-config reload proxy
```


## Configure nginx

```bash
sudo apt install nginx
```

```bash 
DOMAIN=
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/$DOMAIN
sudo ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled
```

### If we use letsencrypt certs
```bash
sudo nano /etc/nginx/sites-available/$DOMAIN
```

First, just configure http
```bash
server {
        listen 80;
        server_name $DOMAIN www.$DOMAIN;
        return 301 https://$DOMAIN$request_uri;
}
```

```bash
sudo certbot --nginx certonly
```

```bash
sudo nano /etc/nginx/sites-available/$DOMAIN
```

Then, add the httpS config

```bash
server {
        listen 443 ssl;
        listen [::]:443 ssl;
        
        server_name $DOMAIN;

        ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
        
        location / {
            proxy_pass http://127.0.0.1:8000;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
}
```


```bash
sudo nginx -t
sudo systemctl restart nginx
```



### If we have our own certs
```bash
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

# HTTPS server to handle JupyterHub
server {
    listen 443 ssl;

    server_name $HOST;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;
    ssl_dhparam /etc/ssl/certs/dhparam.pem;
    ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:AES:CAMELLIA:DES-CBC3-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!aECDH:!EDH-DSS-DES-CBC3-SHA:!EDH-RSA-DES-CBC3-SHA:!KRB5-DES-CBC3-SHA';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;
    add_header Strict-Transport-Security max-age=15768000;

    # Managing literal requests to the JupyterHub front end
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # websocket headers
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        proxy_buffering off;
    }

    # Managing requests to verify letsencrypt host
    location ~ /.well-known {
        allow all;
    }
}

```
    
## Restart nginx
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Uninstall
At least instructions as to which files are installed where would be welcome. As far as I can see, the following locations would have to be removed during an uninstall:

```bash
/opt/tljh (directory)
/usr/bin/tljh-config (symlink)
```
Then there is the three services located at:

```bash
/etc/systemd/system/traefik.service
/etc/systemd/system/jupyterhub.service
```

Edit: you would remove those services by first running
```bash 
sudo systemctl disable <service>
```

and then remove the files themselves, I guess.

Two other things to do are

Remove the `jupyterhub-admins` and `jupyterhub-users` groups with `sudo delgroup <group>`
Remove the extra sudoers file located at `/etc/sudoers.d/jupyterhub-admins`.
Of course, as @yuvipanda said, if you allowed your users to run arbitrary command, then there is no point at all in uninstalling. 
However, in some cases it might make sense to include the information above in the documentation. 

`/home/jupyter-[users added]`
