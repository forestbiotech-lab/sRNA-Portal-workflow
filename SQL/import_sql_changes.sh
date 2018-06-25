#Import new design
file=create_sRNAPlantPortal.sql; echo "USE sRNAPlantPortal;" > $file; cat ~/Downloads/sRNA_plant_portal_mysql_drop.sql ~/Downloads/sRNA_plant_portal_mysql_create.sql >> $file; rm ~/Downloads/sRNA_plant_portal_mysql_create.sql sRNA_plant_portal_mysql_drop.sql;

#Population tables with mirbase data
grep -A1 -E ".*-miR[0-9]+"  ~/Downloads/git/source_data/mirbase/mature.fa | sed /--/d | sed -r "s:^(>.*)$:\1|:g" | tr -d "\n" | sed -r "s:>:\n>:g" | sed -r "s:\|: :g" | awk '{gsub("U","T",$6);gsub(">","",$1);if(NR>1){print "INSERT INTO sRNA_sequence VALUES ("NR-1", \""$6"\", "length($6)");INSERT INTO Annotation (id,accession,name,sRNA,source,organism) VALUES ("NR-1", \""$2"\",\""$1"\","NR-1",1,(SELECT NCBI_TAXON_ID from Organism WHERE Species=\""$3" "$4"\"));"}}' > insert_SEQ_annotation.sql

#Populate Mature_miRNA with arabidopsis data from miRBase
grep -w ath miRNA.tsv | awk -F "\t" '{print "INSERT INTO Mature_miRNA (accession,name,arm,sequence) VALUES (\""$5"\",\""$6"\",\""$3"\",\"5p\",\""$7"\");"}' > ath_mature.sql
#Populate organism
grep "Viridiplantae" organisms.txt |  awk -F "\t" '{split($3, species, " ");print "INSERT INTO Organism (abbreviation,genus,species,ncbi_taxon_id) VALUES (\""$1"\",\""species[1]"\",\""species[2]"\",\""$5"\");"}' > organisms.sql
#Populate Genome
#insert into Genome (organism_id,genome_build,genome_build_id) VALUES (5,"TAIR10","NCBI_Assembly:GCA_000001735.1");
grep -v "#" ath.gff3.txt | awk -F "\t" '{split($9, attr, ";");split(attr[1], ID, "=");print "INSERT INTO Feature (genome_id,name,source,type,start,end,score,strand,phase,attribute_list,attr_id) VALUES (1,\""$1"\",\"miRBase\",\""$3"\",\""$4"\",\""$5"\",\""$6"\",\""$7"\",\""$8"\",\""$9"\",\""ID[2]"\");"}' > feature_ath.sql

#pre_miRNA
grep "ath-" miRNA.tsv | awk -F "\t" '{print "INSERT INTO Pre_miRNA (accession,mature_miRNA_id,feature_id,sequence) VALUES(\""$1"\",(select id from Mature_miRNA where accession=\""$5"\"),(select id from Feature  where attr_id=\""$1"\"),\""$4"\");"}' > Pre_miRNA_ath.sql
#Dump mysql table to export or backup
mysqldump -u root --add-drop-table sRNAPlantPortal -p > ~/Downloads/git/sRNA_Portal_workflow/SQL/DB_backup/2017_09_26-sRNAPlantPortal_dump.sql

