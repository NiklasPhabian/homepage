---
external: false
draft: false
title: Zero to JupyterHub (the hard way)
description: A quickstart guide on how to set up a JupyterHub on own hardware (or on a VPS)
date: 2022-05-04
--- 


## Intro

Instructions from 
- [hard-install guide from jupyterhub](https://github.com/jupyterhub/jupyterhub-the-hard-way/blob/master/docs/installation-guide-hard.md)
- [jupyterhub quickstart](https://jupyterhub.readthedocs.io/en/latest/quickstart.html)


## Install

### Conda
```bash
curl https://repo.anaconda.com/pkgs/misc/gpgkeys/anaconda.asc | gpg --dearmor > conda.gpg
sudo install -o root -g root -m 644 conda.gpg /etc/apt/trusted.gpg.d/
echo "deb [arch=amd64] https://repo.anaconda.com/pkgs/misc/debrepo/conda stable main" | sudo tee /etc/apt/sources.list.d/conda.list
sudo apt update
sudo apt install conda
sudo /opt/conda/bin/conda update conda
sudo ln -s /opt/conda/etc/profile.d/conda.sh /etc/profile.d/conda.sh
```

### nodejs
```bash
#sudo apt install npm
sudo /opt/conda/bin/conda install -c conda-forge nodejs npm
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
sudo npm install -g configurable-http-proxy
```

### Make Venv
```bash
sudo python3 -m venv /opt/jupyterhub/
source /opt/jupyterhub/bin/activate
```

### Install JH

```bash
sudo /opt/jupyterhub/bin/python3 -m pip install wheel
sudo /opt/jupyterhub/bin/python3 -m pip install jupyterhub jupyterlab
sudo /opt/jupyterhub/bin/python3 -m pip install ipywidgets
sudo /opt/jupyterhub/bin/python3 -m pip install ipympl
```

Don't install any other packages in this env.

If you were to update packages, you might have to re-build jupyterlab:
 
```bash
sudo /opt/jupyterhub/bin/jupyter lab build
```

... which consequently probably means that we have to rebuild the database.
I only tried this once and it ended up in a mess ...


Verify the install
```bash
/opt/jupyterhub/bin/jupyter labextension list
```

should yield something like
```bash
JupyterLab v3.4.5
/opt/jupyterhub/share/jupyter/labextensions
        jupyterlab_pygments v0.2.2 enabled OK (python, jupyterlab_pygments)
        jupyter-matplotlib v0.11.2 enabled OK
        @jupyter-widgets/jupyterlab-manager v5.0.3 enabled OK (python, jupyterlab_widgets)
```


## Configure
Create configuration

```bash
sudo mkdir -p /opt/jupyterhub/etc/jupyterhub/
cd /opt/jupyterhub/etc/jupyterhub/
sudo /opt/jupyterhub/bin/jupyterhub --generate-config
```

We should now be able to run
```bash
sudo /opt/jupyterhub/bin/jupyterhub -f /opt/jupyterhub/etc/jupyterhub/jupyterhub_config.py
```

### Users

Might be wise to edit the following:

```bash
sudo nano /opt/jupyterhub/etc/jupyterhub/jupyterhub_config.py
```

```
c.Authenticator.allowed_users = {'griessbaum', 'zoe', 'inara', 'kaylee'}
c.Authenticator.admin_users = {['griessbaum', 'zoe']}
c.JupyterHub.admin_access = True
```
    
## SSL / Letsencrypt 
Create own certificats and sign them with certbot/letsencrypt:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:1024 -keyout jupyter.key -out jupyter.pem
sudo apt install letsencrypt certbot
sudo certbot certonly --standalone -d $DOMAIN
```


### Update config
```bash
sudo nano /opt/jupyterhub/etc/jupyterhub/jupyterhub_config.py
```

```bash
c.JupyterHub.bind_url = 'https://$DOMAIN:443'
#c.JupyterHub.port = '443'
c.JupyterHub.ssl_cert = '/etc/letsencrypt/live/brenjupyter.duckdns.org/fullchain.pem'
c.JupyterHub.ssl_key = '/etc/letsencrypt/live/brenjupyter.duckdns.org/privkey.pem'
```

### Cookie secret

```bash
sudo mkdir /srv/jupyterhub/
openssl rand -hex 32 > /srv/jupyterhub/jupyterhub_cookie_secret
c.JupyterHub.cookie_secret_file = '/srv/jupyterhub/jupyterhub_cookie_secret'
sudo chmod 600 /srv/jupyterhub/jupyterhub_cookie_secret
```


### Proxy authentication token

    
    
## Set up JH as service
```bash
sudo mkdir -p /opt/jupyterhub/etc/systemd
sudo nano /opt/jupyterhub/etc/systemd/jupyterhub.service
```

```bash
[Unit]
Description=JupyterHub
After=syslog.target network.target

[Service]
User=root
Environment="PATH=/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/opt/jupyterhub/bin"
ExecStart=/opt/jupyterhub/bin/jupyterhub -f /opt/jupyterhub/etc/jupyterhub/jupyterhub_config.py

[Install]
WantedBy=multi-user.target
```

```bash
sudo ln -s /opt/jupyterhub/etc/systemd/jupyterhub.service /etc/systemd/system/jupyterhub.service
```


## Create default conda env for all ... not really needed
```bash
sudo mkdir /opt/conda/envs/
sudo /opt/conda/bin/conda create --prefix /opt/conda/envs/python python=3.10 ipykernel
sudo /opt/conda/envs/python/bin/python -m ipykernel install --prefix /usr/local/ --name 'python' --display-name "Python (default)"
```
