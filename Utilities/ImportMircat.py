#!/usr/bin/env python3

import  mysql.connector
from mysql.connector import errorcode
from datetime import date, datetime, timedelta
import sys
import getpass


#Declaring files and variables
hairpins="lib0*_filt-19_25_5_scaff-1k_mirbase_noncons_miRNA_hairpins_filtered.txt"
mircat="../Lib0*-mircat-filtered-artigo.csv"
gff3="qsu-novel-miRNA.gff3"

species="Quercus_suber"
species_abbr="qsu"
mirbaseV=22
#currentDate=$(date +"%y/%m/%d")

#mature_meta="${species_abbr}-mature.sql"
#mature_sequence="${species_abbr}-mature_sequence.sql"
#pre_meta="${species_abbr}-precursor.sql"
#pre_sequence="${species_abbr}-precursor_sequence.sql"
#feature="${species_abbr}-feature.sql"
#feature_attribute_list="${species_abbr}-feature_attribute_list.sql"


user="root"
password=getpass.getpass("Type password")
host="127.0.0.1"
database="sRNAPlantPortal"





try:
	cnx = mysql.connector.connect(user=user,password=password,host=host,database=database)
except mysql.connector.Error as err:
  if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
    print("Something is wrong with your user name or password")
  elif err.errno == errorcode.ER_BAD_DB_ERROR:
    print("Database does not exist")
  else:
    print(err)
  cnx.close()

cursor = cnx.cursor()


query = ("SELECT g.id FROM Organism as o,Genome as g WHERE g.organism_id=o.id AND ncbi_taxon_id=3694")

cursor.execute(query)

for i in cursor:
  print(i)

cursor.close()
cnx.close()