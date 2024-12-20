# Forked from https://gist.github.com/vielhuber/96eefdb3aff327bdf8230d753aaee1e1#file-script-sh

# best practice: linux
nano ~/.pgpass
*:5432:*:username:password
chmod 0600 ~/.pgpass

# best practice: windows
edit %APPDATA%\postgresql\pgpass.conf
*:5432:*:username:password

# linux
PGPASSWORD="password" pg_dump --no-owner -h host -p port -U username database > file.sql

# windows
PGPASSWORD=password&& pg_dump --no-owner -h host -p port -U username database > file.sql

# alternative
pg_dump --no-owner --dbname=postgresql://username:password@host:port/database > file.sql

# restore
psql --set ON_ERROR_STOP=on -U postgres -d database -1 -f file.sql
pg_restore --no-privileges --no-owner -U postgres -d database --clean file.sql # only works for special dumps

# backup excluding table
pg_dump --no-owner -h 127.0.0.1 -p 5432 -U username --exclude-table=table1 --exclude-table=table2 --exclude-table=table1_id_seq --exclude-table=table2_id_seq database > tmp.sql

# backup including only table
pg_dump --no-owner -h 127.0.0.1 -p 5432 -U username --table=table1 --table=table2 database > tmp.sql

# backup only schema (no data)
pg_dump --no-owner -h 127.0.0.1 -p 5432 -U username --schema-only database > tmp.sql

# transfer database with 2 tables empty
pg_dump --no-owner -h 127.0.0.1 -p 5432 -U username --exclude-table=table1 --exclude-table=table2 --exclude-table=table1_id_seq --exclude-table=table2_id_seq database > 1.sql
pg_dump --no-owner -h 127.0.0.1 -p 5432 -U username --table=table1 --table=table2 --schema-only database > 2.sql
psql --set ON_ERROR_STOP=on -U username -d database -1 -f 1.sql
psql --set ON_ERROR_STOP=on -U username -d database -1 -f 2.sql

# backup all databases
#!/bin/bash
databases=`echo "postgres-user-password" | su -c "psql -l -t | cut -d'|' -f1 | sed -e 's/ //g' -e '/^$/d'" postgres`
for i in $databases; do if [ "$i" != "postgres" ] && [ "$i" != "template0" ] && [ "$i" != "template1" ] && [ "$i" != "template_postgis" ]; then
    echo dumping $i
    PGPASSWORD=database-user-password pg_dump --no-owner -h 127.0.0.1 -p 5432 -U username $i > /var/www/backup/$i.sql
  fi
done

# backup and restore
PGPASSWORD=password && pg_dump --no-owner -h 127.0.0.1 -p 5432 -U username database > tmp.sql
psql -U postgres -d database -c "drop schema public cascade; create schema public;"
psql --set ON_ERROR_STOP=on -U postgres -d database -1 -f tmp.sql
rm tmp.sql

# if you need to remove unintentionally backuped owners afterwards
sed -i.bak '/OWNER TO specialowner/d' input.sql