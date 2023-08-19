#source config_skunk.ini
source config_wort.ini

scp load_region.sh $USER@$HOST:~/load_region.sh
scp analyze_log.sh $USER@$HOST:~/analyze_log.sh

scp -r log $USER@$HOST:~/log 
scp -r monitor $USER@$HOST:~/monitor

#scp postgresql.conf root@$HOST:/etc/postgresql/9.5/main/postgresql.conf
#scp pg_hba.conf root@$HOST:/etc/postgresql/9.5/main/pg_hba.conf
