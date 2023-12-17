--- 
title: Domestic Solarthermal Energy
description: Notes on experiments with a solarthermal energy system for domestic hot water pre-heating
date: 2023-08-22
---


# Intro
I live in an area with quite high solar input ([globalsolaratlas](https://globalsolaratlas.info/detail?c=37.331949,-118.444977,11&s=37.359242,-118.399658&m=site)). My domestic hot water is electric, leading to the DHW to probably account for 80% of my electricity consumption.

This is an attempt to pre-heat the mains intput into my water heater


## Preliminary Calculation
There are some devices on amazon, such as a [dome panel](https://www.amazon.com/Funmit-Solar-HEA-TER-Inground-Equipment/dp/B09TP3PW2V/ref=sr_1_23?crid=AS1OJOMKEMOB&keywords=solar+water+heater&qid=1695499547&sprefix=solar+water+heate%2Caps%2C165&sr=8-23&ufe=app_do%3Aamzn1.fos.f5122f16-c3e8-4386-bf32-63e904010ad0), and [flat panels](https://www.amazon.com/Supply-SwimEasy-Heater-Replacement-Expectancy/dp/B0C539NT12/ref=sxin_16_pa_sp_search_thematic_sspa?content-id=amzn1.sym.afd9c6b4-b179-4d6a-8ad1-7056a39c01ab%3Aamzn1.sym.afd9c6b4-b179-4d6a-8ad1-7056a39c01ab&crid=EA4A20NH8VJV&cv_ct_cx=solar+pool+heater&keywords=solar+pool+heater&pd_rd_i=B0C539NT12&pd_rd_r=6e66aecb-c355-452b-a170-3e974e3a0099&pd_rd_w=p5Nd7&pd_rd_wg=zec1Y&pf_rd_p=afd9c6b4-b179-4d6a-8ad1-7056a39c01ab&pf_rd_r=F2X9WBDXH1V7GVTGF7P3&qid=1695499587&sbo=RZvfv%2F%2FHxDF%2BO5021pAnSA%3D%3D&sprefix=solar+pool+he%2Caps%2C286&sr=1-1-2b34d040-5c83-4b7f-ba01-15975dfb8828-spons&ufe=app_do%3Aamzn1.fos.f5122f16-c3e8-4386-bf32-63e904010ad0&sp_csd=d2lkZ2V0TmFtZT1zcF9zZWFyY2hfdGhlbWF0aWM&psc=1).

Considering the Global tilted irradiation at optimum angle of about 6.8 kWh/m/m/day at my location, the following energy should be gainable with the dome panel, the flat panel, and a 30 ft 1/8 inch hose.



|              | Unit           | Panel | Dome Panel  | Hose    |
| :--          |:--             | --:   | --:         | --:     |
| Width	       | m	            | 0.60  | 0.57	      | 0.0127  |
| Length	   | m	            | 3.00	| 0.57	      | 30.48   |
| Area	       | m*m	        | 1.86	| 0.33	      | 0.39    |
| GTI	       | kWh/m/m/day	| 6.80	| 6.80	      | 6.8     |
| Daily Energy | kWh/day	    | 12.63	| 2.22	      | 2.63    |


## Measuring setup

### Flow
- https://tutorials-raspberrypi.com/reading-out-the-flow-meter-water-flow-sensor-on-the-raspberry-pi/#google_vignette
- https://www.bentasker.co.uk/posts/blog/house-stuff/monitoring-a-fishtank-with-influxdb-and-grafana.html
- https://www.amazon.com/dp/B07QQW7JZL?psc=1&ref=ppx_yo2ov_dt_b_product_details


### Temp
- https://pinout.xyz/pinout/1_wire
- https://www.amazon.com/dp/B012C597T0?psc=1&ref=ppx_yo2ov_dt_b_product_details
- https://www.circuitbasics.com/raspberry-pi-ds18b20-temperature-sensor-tutorial/




1. `sudo nano /boot/config.txt`
`dtoverlay=w1-gpio`
1. Reboot 
1. `sudo modprobe w1-gpio`
1. `sudo modprobe w1-therm`
1. `cd /sys/bus/w1/devices`
1. `ls`


sudo dtoverlay w1-gpio gpiopin=4 pullup=0
sudo dtoverlay w1-gpio gpiopin=17 pullup=0
