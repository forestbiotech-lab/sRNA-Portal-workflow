#Import new design
file=create_sRNAPlantPortal.sql; echo "USE sRNAPlantPortal;" > $file; cat ~/Downloads/sRNA_plant_portal_mysql_drop.sql ~/Downloads/sRNA_plant_portal_mysql_create.sql >> $file; rm ~/Downloads/sRNA_plant_portal_mysql_create.sql sRNA_plant_portal_mysql_drop.sql;

#Population tables with mirbase data
grep -A1 -E ".*-miR[0-9]+"  ~/Downloads/git/source_data/mirbase/mature.fa | sed /--/d | sed -r "s:^(>.*)$:\1|:g" | tr -d "\n" | sed -r "s:>:\n>:g" | sed -r "s:\|: :g" | awk '{gsub("U","T",$6);gsub(">","",$1);if(NR>1){print "INSERT INTO sRNA_sequence VALUES ("NR-1", \""$6"\", "length($6)");INSERT INTO Annotation (id,accession,name,sRNA,source,organism) VALUES ("NR-1", \""$2"\",\""$1"\","NR-1",1,(SELECT NCBI_TAXON_ID from Organism WHERE Species=\""$3" "$4"\"));"}}' > insert_SEQ_annotation.sql

#Populate Mature_miRNA with arabidopsis data from miRBase
grep -w ath miRNA.tsv | awk -F "\t" '{print "INSERT INTO Mature_miRNA (accession,name,arm,sequence) VALUES (\""$5"\",\""$6"\",\""$3"\",\"5p\",\""$7"\");"}' > ath_mature.sql



#Dump mysql table to export or backup
mysqldump -u root --add-drop-table sRNAPlantPortal -p > ~/Downloads/git/sRNA_Portal_workflow/SQL/DB_backup/2017_09_26-sRNAPlantPortal_dump.sql

