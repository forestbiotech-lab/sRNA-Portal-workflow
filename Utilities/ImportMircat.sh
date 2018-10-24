hairpins="lib0*_filt-19_25_5_scaff-1k_mirbase_noncons_miRNA_hairpins_filtered.txt"
mircat="../Lib0*-mircat-filtered-artigo.csv"
gff3=qsu-novel-miRNA.gff3

species="Quercus_suber"
species_abbr="qsu"
mirbaseV=22
currentDate=$(date +"%y/%m/%d")

mature_meta="${species_abbr}-mature.sql"
mature_sequence="${species_abbr}-mature_sequence.sql"
pre_meta="${species_abbr}-precursor.sql"
pre_sequence="${species_abbr}-precursor_sequence.sql"
feature="${species_abbr}-feature.sql"
feature_attribute_list="${species_abbr}-feature_attribute_list.sql"


printf "">$mature_meta
printf "">$mature_sequence
printf "">$pre_meta
printf "">$pre_sequence
printf "">$feature_attribute_list
printf "">$feature

printf """##gff-version 3
##"$currentDate"
#
# Chromosomal coordinates of "$species" microRNAs
# microRNAs:               miRBase v"$mirbaseV"
# genome-build-id:         
# genome-build-accession:  
#
# Hairpin precursor sequences have type \"miRNA_primary_transcript\". 
# Note, these sequences do not represent the full primary transcript, 
# rather a predicted stem-loop portion that includes the precursor 
# miRNA. Mature sequences have type \"miRNA\".\n
""">$gff3

#iterate over sequences
counter=0
for s in $(cat $mircat | awk -F "," '{print $6}' | sort | uniq )
do ##one mature can have multiple pre
	#Increment counter
	counter=$(( $counter + 1 ))
	counter_pre=$(( $counter_pre + 1 ))
	#Formate coutner to have 7%d digits
	#Generate miRNA accession and name
	matACC=MPGSMIMAT$(printf "%07d\n" $counter)
	matNAME=MPGSNOVMAT$(printf "%07d\n" $counter)
	
	#Decrease pre counter because it will be incremented in the cycle
	counter_pre=$(( $counter_pre - 1 ))
	#Lookup precursor sequence in hairpin file Which one()
	#iterate over hairpins found

	##Mature sequence
	echo "INSERT IGNORE INTO Mature_miRNA_sequence (\`sequence\`) VALUE (\"$2\");" >> $mature_sequence

	for p in $( cat $hairpins | grep -A3 ">$s" | sed -r /^$/d | sed -r "s:^--$:€:g" | tr -s "\n" "@" | sed -r "s:@€@:@€:g" | tr -s "€" "\n" | sort | uniq )
	do
		counter_pre=$(( $counter_pre + 1 ))
		#Generate pre miRNA accession and name
		preACC=MPGSMIPRE$(printf "%07d\n" $counter_pre)
		preNAME=MPGSNOVPRE$(printf "%07d\n" $counter_pre)
		
		#Calculate the coordinates of hairpin   
		header=$(echo $p | awk -F "@" '{print $1}' )
		coordinates=$(echo $header | awk -F "[/]" '{print $2}')
		chromosome=$(echo $header | sed -r "s:^>[ATGC]*_(.*)/.*:\1:g")
		start=$(echo $coordinates | awk -F "-" '{print $1}')
		end=$(echo $coordinates | awk -F "-" '{print $2}')		

		pre_seq=$(echo $p | awk -F "@" '{print $2}')

		strand=$(cat $mircat | grep -m1 "$chromosome,$start,${end},.*$s" | awk -F "," '{split($4,orient," ");print orient[1]}') 
		if [[ "$strand" == "+" ]]; then
			pre_hairpin_coord=$(echo $p | awk -v start=$start -F "@" '{match($3,"[-<>]+"); print start-RSTART+1"-"start-RSTART+length($3)}')
		else	
			pre_hairpin_coord=$(echo $p | awk -v end=$end -F "@" '{match($3,"[-<>]+"); print end-(length($3)-RSTART)"-"end+RSTART}')
		fi



		pre_hairpin_start=$(echo $pre_hairpin_coord | awk -F "-" '{print $1}')
		pre_hairpin_end=$(echo $pre_hairpin_coord | awk -F "-" '{print $2}')
		miRCat_line=$(grep -m1 "$chromosome" $mircat) 

		echo "#################################################"
		echo "Header:$header coordinates:$coordinates chromosome:$chromosome start:$start end:$end"
		echo "Strand: $strand"
		echo "#############"
		echo "Pre start:$pre_hairpin_start Pre end:$pre_hairpin_end - Start:$start"
		echo "Sequence:$s Precursor:$p"
		echo "##################################################"

		pre_hairpin_half_length=$(( ( $pre_hairpin_end - $pre_hairpin_start ) / 2 ))
		rel_start=$(( $start - $pre_hairpin_start - 1 ))
		#If start is in beggining half
		echo $p 
		side=$(( $rel_start - $pre_hairpin_half_length ))
		if [[ "$side" -ge "0" ]]; then
			if [[ "$strand" == "+" ]]; then
				arm=3p
			else
				arm=5p
			fi
		else
			if [[ "$strand" == "+" ]]; then
				arm=5p
			else
				arm=3p
			fi
		fi
		echo $side
		##Mature metadata
		echo "INSERT INTO Mature_miRNA (accession,name,arm,sequence_id,feature_id,pre_miRNA_id) VALUES (\"${matACC}\",\"${matNAME}\",\"${arm}\",(select id from Mature_miRNA_sequence where sequence=\"${s}\"),(select id from Feature where attr_id=\"${matACC}\"),(select id from Pre_miRNA where accession=\"${preACC}\"));" >> $mature_meta 
		echo "INSERT INTO Mature_miRNA (accession,name,arm,sequence_id,feature_id,pre_miRNA_id) VALUES (\"${matACC}\",\"${matNAME}\",\"${arm}\",(select id from Mature_miRNA_sequence where sequence=\"${s}\"),(select id from Feature where attr_id=\"${matACC}\"),(select id from Pre_miRNA where accession=\"${preACC}\"));"
		#Precursor sequence
		echo "call addPreSequence(${pre_seq})" >> $pre_sequence; 
		#Precursor metadata
		echo "INSERT INTO Pre_miRNA (accession,name,feature_id,sequence_id) VALUES(\"${preACC}\",\"${preNAME}\",(select id from Feature where attr_id=\"${preACC}\"),(select id from Pre_miRNA_sequence where sequence=\"${pre_seq}\"));" >> $pre_meta


		#GFF
		##precursor GFF
		printf "${chromosome}\tmiRPursuit\tmiRNA_primary_transcript (S0:0000647)\t$start\t$end\t.\t?\t.\tID=${preACC};Alias=${preACC};Name=${preNAME}\n" >> $gff3

		#Mature is part of pre so the strand is the same for both.
		printf "INSERT INTO Feature (\`genome_id\`,\`name\`,\`source\`,\`type\`,\`start\`,\`end\`,\`strand\`,\`atrr_id\`) VALUE (3,\"${chromosome}\",\"miRPursuit\",\"miRNA_primary_transcript (S0:0000647)\",\"$pre_hairpin_start\",\"$pre_hairpin_end\",\"${strand}\",\"${preACC}\");\n" >> $feature
		printf "INSERT INTO Feature_attribute_list (\`feature_id\`,\`key\`,\`value\`) VALUE ((SELECT id FROM Feature where attr_id=\"${preACC}\"),\"ID\",\"${preACC}\");\n" >> $feature_attribute_list
		printf "INSERT INTO Feature_attribute_list (\`feature_id\`,\`key\`,\`value\`) VALUE ((SELECT id FROM Feature where attr_id=\"${preACC}\"),\"Alias\",\"${preACC}\");\n" >> $feature_attribute_list
		printf "INSERT INTO Feature_attribute_list (\`feature_id\`,\`key\`,\`value\`) VALUE ((SELECT id FROM Feature where attr_id=\"${preACC}\"),\"Name\",\"${preNAME}\");\n" >> $feature_attribute_list

		##mature miRNA GFF
		printf "${chromosome}\tmiRPursuit\tmiRNA (SO:0000276)\t$pre_hairpin_start\t$pre_hairpin_end\t.\t$strand\t.\tID=${matACC};Alias=${matACC};Name=${matNAME};Derives_from=$preACC\n" >> $gff3
		printf "INSERT INTO Feature (\`genome_id\`,\`name\`,\`source\`,\`type\`,\`start\`,\`end\`,\`strand\`,\`atrr_id\`) VALUE (3,\"${chromosome}\",\"miRPursuit\",\"miRNA (SO:0000276)\",\"$start\",\"$end\",\"${strand}\",\"${preACC}\");\n" >> $feature
		printf "INSERT INTO Feature_attribute_list (\`feature_id\`,\`key\`,\`value\`) VALUE ((SELECT id FROM Feature where attr_id=\"${preACC}\"),\"ID\",\"${matACC}\");\n" >> $feature_attribute_list
		printf "INSERT INTO Feature_attribute_list (\`feature_id\`,\`key\`,\`value\`) VALUE ((SELECT id FROM Feature where attr_id=\"${preACC}\"),\"Alias\",\"${matACC}\");\n" >> $feature_attribute_list
		printf "INSERT INTO Feature_attribute_list (\`feature_id\`,\`key\`,\`value\`) VALUE ((SELECT id FROM Feature where attr_id=\"${preACC}\"),\"Name\",\"${matNAME}\");\n" >> $feature_attribute_list
		printf "INSERT INTO Feature_attribute_list (\`feature_id\`,\`key\`,\`value\`) VALUE ((SELECT id FROM Feature where attr_id=\"${preACC}\"),\"Name\",\"${preACC}\");\n" >> $feature_attribute_list



	done	
done



