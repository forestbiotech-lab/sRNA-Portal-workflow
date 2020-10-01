#!/usr/bin/env bash

user=$1
database=$2

if [[ $1 == "" ]]; then
	echo "Terminating - User not provided"
	exit 0
fi
if [[ $2 == "" ]]; then 
	echo "Terminating - Database not provided"
	exit 0
fi

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

backupStructure=${DIR}/../SQL/DB_backup/$(date +"%y-%m-%d-%H:%M:%S")-${database}_structure-dump.sql
backupData=${DIR}/../SQL/DB_backup/$(date +"%y-%m-%d-%H:%M:%S")-${database}_data-dump.sql

mysqldump -u ${user} --add-drop-table --no-data=TRUE ${database} -p > $backupStructure
mysqldump -u ${user} --no-create-info ${database} -p > $backupData

cp $backupData ${DIR}/../SQL/LATEST_dump.sql

echo "Database $database backed up successfully."

exit 0