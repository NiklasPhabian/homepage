---
external: false
draft: false
title: Creating a jupyter conda kernel for geospatial stuff
description: Setting up a jupyter kernel to be used in JupyterHub for geospatial analysis
date: 2022-09-02
--- 



## Setting up the kernel

### Creating Kernel
From [https://gdcoder.com/](https://gdcoder.com/how-to-create-and-add-a-conda-environment-as-jupyter-kernel/)

```bash
pip3 cache purge
conda clean -y --all
conda update conda
ENVNAME=stare
conda create -y -n $ENVNAME python=3.10
conda activate $ENVNAME
conda install -y -c conda-forge mamba
mamba install -y -c conda-forge ipykernel
python -m ipykernel install --user --name $ENVNAME --display-name $ENVNAME 
jupyter kernelspec list
```
 
### Removing kernel
```bash
conda env list
conda activate $ENVNAME
jupyter-kernelspec uninstall $ENVNAME
conda deactivate
conda env remove -y -n $ENVNAME
```

### Installing  Resource manager
```bash
pip install jupyter-resource-usage
```

### Installing mpl widgets
Has to be installed on the env that jupyterhub is running on as well. e.g.:
```bash
sudo /opt/jupyterhub/bin/python3 -m pip install ipympl
```

Then in the kernel:
```bash
pip install ipympl
mamba install -y -c conda-forge ipympl
```

Regarding "Error displaying widget: model not found"

- Try to restart the jupyterhub process
- Also clear ~/.local/share/jupyter*
- downgrade 

```bash
pip3 index versions ipywidgets
pip3 install ipywidgets==7.7.2

pip3 install jupyterlab-widgets==3.0.0
pip3 install widgetsnbextension
```

## Setup geospatial (stare) env
The dependencies are odd. Going in seems tomatter


### Gdal
might as well throw the outdated system gdal out

```bash
sudo apt remove libgdal-dev gdal-bin
mamba install -c conda-forge gdal
```

I ran into issues with gdal, failing to veriyf popler-data.
I cleaned all to fix it:

```bash
conda clean --all
```
Other attempts

```bash
conda clean --packages --tarballs
mamba remove poppler
mamba install poppler
mamba install -f poppler
```

### Cartopy, and proj, rasterio
Make sure that pyproj and cartopy have not been installed with (gdal) binaries.
By default, they ship with a small binary version of gdal. 
We need to make sure they use a full gdal instead. Either the system's from apt or from conda.
[gh issue](https://github.com/rasterio/rasterio/issues/2026)

```bash
pip3 uninstall -y pyproj cartopy rasterio
```

```bash
mamba install -c conda-forge proj
mamba install -c conda-forge cartopy
mamba install -c conda-forge rasterio
mamba install -c conda-forge pyproj
mamba install -c conda-forge scipy
mamba install -c conda-forge rioxarray
mamba install -c conda-forge contextily
```

or rather:
```bash
mamba install -c conda-forge proj cartopy rasterio pyproj scipy rioxarray contextily geopandas
```

Installing from pip *appears* to work; but the kernel crashes when using cartopy 

```bash
pip3 install cartopy --no-binary cartopy
pip3 install pyproj --no-binary pyproj
pip3 install rasterio --no-binary rasterio
```

To transform images, we also need scipy
```bash
pip3 install scipy
```


### Geopandas
Careful; If you have installed cartopy from pypi, DON'T install geopandas from conda.
It will create a conflict (I think with shapely) and cause a runtime error when importing cartopy

```bash
mamba install -y -c conda-forge geopandas
```

```bash
pip3 install geopandas
```

### DB interactions
```bash
mamba install -c conda-forge psycopg2
mamba install -c conda-forge sqlalchemy
mamba install -c conda-forge geoalchemy2
```

```bash
sudo apt install libpq-dev
pip3 install psycopg2 
pip3 install geoalchemy2
```

### Dask
I am not sure if this might conflict with starepandas. Also, there was an issue with 2022.8.0 and starepandas

```bash
mamba install -c conda-forge dask
```

### STARE
```bash
pip3 install pystare
pip3 install starepandas
```

### CCL
```bash
pip3 install connected-components-3d
``` 
