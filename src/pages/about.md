---
layout: '../layouts/index.astro'
---

# About me
I studied mechanical engineering at the KIT in Karlsruhe and worked for 5 years for a utility company, on the acquisition of energy market intelligence, analysis of domestic energy demand, and micro co-generation systems. I increasingly got interested in data infrastructure; specifically for geospatial data. This prompted me to pursue a Ph.D. in environmental sciences at the University of California, Santa Barbara, where I wrote my dissertation, titled ["Towards the Twilight of File-Centricity"](https://www.proquest.com/openview/bae0d92f7d3c7f4cc47e128bcd6791e8/1?pq-origsite=gscholar&cbl=18750&diss=y). During my Ph.D., I developed the [OCCUR](https://github.com/NiklasPhabian/occur), wrote (python and pandas) interfaces for the [STARE](../blog/stare), and worked on improving the accuracy of fractional snow cover estimates from multispectral remote sensing data ([IGARSS](https://2023.ieeeigarss.org/view_paper.php?PaperNum=5752)/[poster](/homepage/downloads/igarss2023.pdf)).

I spend some time working as a **lecturer** for UCSB, teaching [Geographical Information Systems (GIS)](https://bren.ucsb.edu/courses/esm-263) for the Masters of Environmental Science and Management at the Bren School, as well as a two-part [introductory course on Data Science](https://datascience.ucsb.edu/course/1), based on UC Berkeley's [Data 8: Foundations of Data Science](http://www.data8.org/) course. I am also a **scientific programmer** for *Bayesics LLC* (the company developing STARE), working on cyberinfrastructure for geospatial data, and assist *Natural Capital Consulting* in moving their geospatial analysis to the cloud.

Currently, I am a scientist at Leidos working on snow and mobility.

Besides those professional endeavors, my personal interests and thus the posts on this page are somewhat loosely connected to the following topics.

### Geospatial Data Engineering
- I seem to have made it through a 6 years Ph.D. program with a Geographer as my advisor while refusing to understand map projections. [SphereGIS](https://github.com/NiklasPhabian/SphereGIS) is my attempt to explain spherical geospatial coincidence tests to myself; some of whose routines are used in [STARE](../blog/stare).

I wrote some recipes to:
- A recipe to [set up a geoserver](../blog/geoserver_install/); specifically on a production/off-premise machine, such as a AWS/GCC VPS.
- An [guide  to prepare and serve COGs](../blog/cog/) from cloud object stores via geoserver to ArcOnline
- A recipe to [create a jupyter conda kernel for geospatial stuff](../blog/geo_conda_kernel/) to be used in a jupyterhub.
- Considerations and a recipe to [set up a (cheap) PostGIS server](../blog/zero_to_postgis/)
- A recipe to [load OSM PGFs (e.g. from geofabrik or planet.openstreetmap.org) to PostGIS](../blog/load_pbf/)

There are also some repositories to
- [Download data from ladsweb](https://github.com/NiklasPhabian/ladsweb_downloader)
- [Download data from arthurhouhttps (STORM)](https://github.com/NiklasPhabian/arthurhouhttps_dl)
- [Get and convert SNODAS data](https://github.com/NiklasPhabian/snodas)
- [load MODIS/VIIRS level-2 data to PostGIS](https://github.com/NiklasPhabian/postgis_loader)
- [load MODIS/VIIRS level-2 data to SciDB](https://github.com/NiklasPhabian/scidb_loader)


### Scavenging
I really hate waste and truly believe that nothing is ever really broken. Fixing things and getting a second life out of stuff gives me a huge kick. This e.g. lead me to [convert a 8 USD thrift-store home wifi-router to a eduroam wifi bridge](../blog/eduroam), to [re-stock an old  NAS](../blog/buffalo), and build a scrap server to host OSM planet], [repair some active speakers](../blog/audioengine).

### Energy and efficiency
This might tie back into my dislike for waste, but domestic energy consumption and efficiency certainly fascinates me. 
- [Some notes on my guerilla PV system](../blog/pv/)
- A [repository](https://bitbucket.org/niklasphabian/sce_downloader/src/master/) to download the hourly energy usage data from the SCE website
- A [collection of scripts](https://bitbucket.org/niklasphabian/energy_db/src/master/) to download public energy market data from European Energy Exchange 

### Random 
- I build this website with astro. Here is the [repository of this website](https://github.com/NiklasPhabian/homepage)
- [Repository to linux drivers to a red button gadget](https://github.com/NiklasPhabian/red_button/)
- [An attempt to estimate how many people are at sea](../blog/vesselfinder/)
- [A script to generate bullshit-bingo fields for corporate meetings](https://bitbucket.org/niklasphabian/bullshitbingo/src/master/)
- [Brute-force generating a boggle/ruzzle field](https://bitbucket.org/niklasphabian/ruzzle/src/master/)
- [Extract subtitles from mp4 and mkv](../blog/subtitles/)
- [Download SMS via ADB](../blog/sms/)

### Dissertation
- I wrote my dissertation in markdown, converted it via pandoc to latex and compiled the latex via xelatex to pdf. Here is the repository to the [build system](../blog/dissertation/) I used to compile my dissertation.
- [The OPeNDAP Citation Creator](https://github.com/NiklasPhabian/occur)
