---
external: false
title: The Littlest JupyterHub
description: Notes on setting up TLJH
date: 2021-05-12
--- 

Pretty odd setup: I had to go abroad, but my phone provider would not allow me to receive SMS while outside the US. I put my simcard in an old rooted Nexus 4 phone and hooked it up to a raspberry pi. 

the messages are stored at `/data/user_de/0/com.android.providers.telephony/databases/mmssms.db`.
I made the db readable by all:

```bash
chmod 777  /data/user_de/0/com.android.providers.telephony/databases/mmssms.db
```

Then copy the DB to the download folder and download it from there
```bash
adb -s 007a422861d52a4f shell "su -c 'cp /data/user_de/0/com.android.providers.telephony/databases/mmssms.db /sdcard/Download/mmssms.db'"
adb -s 007a422861d52a4f pull /sdcard/Download/mmssms.db mmssms.db
```

Then read the SMS into a dataframe:

```python
import sqlalchemy
import pandas

db = sqlalchemy.create_engine('sqlite:///mmssms.db')

query = "SELECT datetime(date/1000, 'unixepoch', 'localtime') as datetime,  address, body FROM sms ORDER BY date DESC"

df = pandas.read_sql(sql=query, con=db, index_col="datetime", parse_dates=["datetime"])
 ```
