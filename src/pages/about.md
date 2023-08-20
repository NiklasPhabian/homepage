---
layout: '../layouts/index.astro'
---

# About me
I studied mechanical engineering at the KIT in Karlsruhe and worked for 5 years for a utility company, on the acquisition of energy market intelligence, analysis of domestic energy demand, and micro co-generation systems. I increasingly got interested in data infrastructure; specifically for geospatial data. This prompted me to pursue a Ph.D. in environmental sciences at the University of California, Santa Barbara, where I wrote my dissertation, titled ["Towards the Twilight of File-Centricity"](https://www.proquest.com/openview/bae0d92f7d3c7f4cc47e128bcd6791e8/1?pq-origsite=gscholar&cbl=18750&diss=y). During my Ph.D., I developed the [OCCUR](https://github.com/NiklasPhabian/occur), wrote (python and pandas) interfaces for the [STARE](blog/stare), and worked on improving the accuracy of fractional snow cover estimates from multispectral remote sensing data ([IGARSS](https://2023.ieeeigarss.org/view_paper.php?PaperNum=5752)/[poster](downloads/igarss2023.pdf)).

I am currently working as a **lecturer** for UCSB, teaching [Geographical Information Systems (GIS)](https://bren.ucsb.edu/courses/esm-263) for the Masters of Environmental Science and Management at the Bren School, as well as a two-part [introductory course on Data Science](https://datascience.ucsb.edu/course/1), based on UC Berkeley's [Data 8: Foundations of Data Science](http://www.data8.org/) course.  I am also a **scientific programmer** for Bayesics LLC (the company developing STARE), working on cyberinfrastructure for geospatial data, and assisting *Natural Capital Consulting* in moving geo-spatial analysis to the cloud.

Besides those professional endeavors, my personal interests and thus the posts on this page are somewhat loosely connected to the following topics.


### Geospatial Data Engineering
I seem to have made it through a 6 years Ph.D. program with a Geographer as my advisor while refusing to understand map projections. [SphereGIS](https://github.com/NiklasPhabian/SphereGIS) is my attempt to explain spherical geospatial coincidence tests to myself; some of whose routines are used in [STARE](blog/stare). I wrote some recipes to:

- [set up a geoserver](blog/geoserver_install)
- [serving COGs](blog/cog)
- [create a jupyter conda kernel for geospatial stuff](blog/geo_conda_kernel)
- [set up a cheap postgis server](blog/postgis)
- [loading OSM PGFs (e.g. from geofabrik or planet.openstreetmap.org) to PostGIS](blog/load_pbf)

There are also some repositories to
- [Download data from ladsweb](https://github.com/NiklasPhabian/ladsweb_downloader)
- [Download data from arthurhouhttps (STORM)](https://github.com/NiklasPhabian/arthurhouhttps_dl)
- [load MODIS/VIIRS level-2 data to PostGIS](https://github.com/NiklasPhabian/postgis_loader)
- [load MODIS/VIIRS level-2 data to SciDB](https://github.com/NiklasPhabian/scidb_loader)


### Scavenging
I really hate waste and truly believe that nothing is ever really broken. Fixing things and getting a second life out of stuff gives me a huge kick. This e.g. lead me to [convert a 8 USD thrift-store home wifi-router to a eduroam wifi bridge](blog/eduroam), to [re-stock an old  NAS](blog/buffalo), and build a scrap server to host OSM planet].

### Energy and efficiency
This might tie back into my dislike for waste, but domestic energy consumption and efficiency certainly fascinates me. 
- [Some notes on my guerilla PV system](blog/pv) 
- https://bitbucket.org/niklasphabian/sce_downloader/src/master/
- https://bitbucket.org/niklasphabian/energy_db/src/master/

### Random 
- [dissertation build system](blog/dissertation)
- [repository of this website](https://github.com/NiklasPhabian/homepage)
- https://github.com/NiklasPhabian/red_button
- https://github.com/NiklasPhabian/occur
- [An attempt to estimate how many people are at sea](blog/vesselfinder) 
- [A script to generate bullshit-bingo fields for corporate meetings](https://bitbucket.org/niklasphabian/bullshitbingo/src/master/)
- [Brute-force generating a boggle/ruzzle field](https://bitbucket.org/niklasphabian/ruzzle/src/master/)- 
- [Extract subtitles from mp4 and mkv](blog/subtitles)
- [Download SMS via ADB](blog/sms)






