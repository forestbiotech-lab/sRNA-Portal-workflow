import sys
from species import Species
from features import Features
from miRNA import MiRNA 
from colors import Bcolors as bc
import os

####INPUT#####
abbr=sys.argv[1]
verbose=False
if len(sys.argv)==3:
	if sys.argv[2][0]=="v":
		verbose=True

###Files####
organisms_file="/home/brunocosta/Documentos/Projectos/portal-sRNA/miRBase/organisms.txt"
miRNA_file="/home/brunocosta/Documentos/Projectos/portal-sRNA/miRBase/miRNA.tsv"


species=Species(organisms_file)
species.select(abbr)
species.getCommonName()
gff3=species.loadGFF()
species.connectDB()

try:
	gca=species.gff3_params["genome-build-accession"].split(":")[1]
	species.buildSQLstatement_genome(gca)
except KeyError:
	print("[SPECIES] - %sWarning!%s - genome-build-accession not found!" %(bc.WARNING,bc.ENDC))
	species.loadGFF(True)
	species.buildSQLstatement_genome(True)
species.buildSQLstatement_organism()

##Genome and Species
genome_id=""
proceed=input("[SPECIES] - %sInsert Genome and Species?%s: " %(bc.HEADER,bc.ENDC))
if proceed in ["y","yes","Y","YES","Yes"]:
	(org_id,genome_id)=species.insertData()
else:
	print("[SPECIES] - %sWarning!%s - No data inserted!" %(bc.WARNING,bc.ENDC))
	genome_id=species.getGenomeId()
species.disconnectDB()

###### Features
proceed=input("%sAdd features?%s: " %(bc.HEADER,bc.ENDC))
if proceed in ["y","yes","Y","YES","Yes"]:
	if genome_id is not "":
		feat=Features(gff3)
		feat.process(genome_id)
		os.rename(gff3,gff3.replace("TODO","Processed"))

##### miRNA
proceed=input("%sAdd miRNAs?%s: " %(bc.HEADER,bc.ENDC))
if proceed in ["y","yes","Y","YES","Yes"]:
	miRNA=MiRNA(miRNA_file,abbr)
	proceed=input("%sAdd Precursors?%s: " %(bc.HEADER,bc.ENDC))
	if proceed in ["y","yes","Y","YES","Yes"]:
		miRNA.extractPrecursors()
		miRNA.insertPrecursors(verbose)
	proceed=input("%sAdd Mature miRNAs?%s: " %(bc.HEADER,bc.ENDC))
	if proceed in ["y","yes","Y","YES","Yes"]:	
		miRNA.extractMature()
		miRNA.insertMature(verbose)
