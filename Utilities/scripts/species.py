#!/usr/bin/env python3

import sys
from scripts.database import Database
from urllib import request
from urllib import error
import json
import getpass
import os
import re
from scripts.colors import Bcolors as bc

import xml.etree.ElementTree as ET

###Files####
organisms_file="organisms.txt"


class Species:
	def __init__(self,organisms):
		org_dict={}
		organisms=open(organisms,"r")

		for o in organisms:
			if not o[0]=="#":
				o=o.strip().split("\t")
				org_dict[o[0]]=o[1::]
		self.org_dict=org_dict

	def select(self,specie):
		self.specie=self.org_dict[specie]
		print("Selected: "+self.org_dict[specie][1])
		self.specie.append(specie)

	def getCommonName(self,url=None,showRes=None):
		if url==None:
			url="https://www.ebi.ac.uk/ols/api/ontologies/ncbitaxon/terms?iri=http://purl.obolibrary.org/obo/NCBITaxon_"

		if self.specie==None:
			print("[SPECIES] - Select a species first")
			exit(1)
		else:
			url=url+self.specie[3]
			response=request.urlopen(url)
			parsed_response=response.read().decode("utf-8").replace("\n","")
			response_json=json.loads(parsed_response)
			obo_synonyms=response_json["_embedded"]["terms"][0]["obo_synonym"]
			if showRes is not None:
				self.prettyPrint(obo_synonyms)
			#Search in array obo_synonym for the first name with type “common name” or related
			self.common_name=[]
			for i in obo_synonyms:
				if i["type"]=="common name":
					self.common_name.append(i["name"])
				if i["type"]=="genbank common name":
					self.common_name.append(i["name"])
			print("[SPECIES] - Extracted the following common names:")
			print(self.common_name)
			print("[SPECIES] - Using the first occurrence: "+self.common_name[0])
			self.common_name_selected=0

	def changeCommonName(self,index):
		if index<len(self.common_name):
			self.common_name_selected=index
		else:
			print("[SPECIES] - %sFailure!%s - Index out of bounds!" %(bc.FAIL,bc.ENDC))
			exit(1)


	def organismData(self):
		data={}
		if self.specie==None:
			print("[SPECIES] - %sFailure!%s - Please select specie first!" %(bc.FAIL,bc.ENDC))
			exit(1)
		else:
			data["abbreviation"]=self.specie[4]
			data["ncbi_taxon_id"]=self.specie[3]
			data["genus"]=self.specie[1].split(" ")[0]
			data["specific_name"]=self.specie[1].split(" ")[1]
		if self.common_name == None:
			print("[SPECIES] - %sFailure!%s - Get common name first!" %(bc.FAIL,bc.ENDC))
			exit(1)
		else:
			data["common_name"]=self.common_name[self.common_name_selected]
		self.data_organism=data

	def buildSQLstatement_organism(self):
		self.add_organism()
		self.organismData()
		self.db.prettyPrint(self.insert_organism, self.data_organism)
	
	def buildSQLstatement_genome(self,id=None,debug=False):
		self.add_genome()
		if id is None:
			id=input("[SPECIES] - Type id to fetch genome: ")
		self.genomeData(id,debug)
		print("Printing integration")
		self.db.prettyPrint(self.insert_genome, self.data_genome)
	
	def connectDB(self):
		self.db=Database()
	def disconnectDB(self):
		self.db.close()

	def insertData(self):
		org_id=self.db.insertData(self.insert_organism, self.data_organism) 
		self.data_genome["organism_id"]=org_id
		genome_id=self.db.insertData(self.insert_genome, self.data_genome)
		self.db.commit()
		return [org_id,genome_id]


	def getGenomeId(self):
		taxon_id=self.specie[3]
		query="SELECT g.id FROM Organism as o,Genome as g WHERE g.organism_id=o.id AND ncbi_taxon_id=%s" %(taxon_id)
		return self.db.query(query)[0][0]


	def prettyPrint(self,jsonObject):
		print(json.dumps(jsonObject,sort_keys=True,indent=4))	

	def loadGFF(self,debug=False):
		file_dir="/home/brunocosta/Documentos/Projectos/portal-sRNA/miRBase/"
		file=self.specie[4]+".gff3.txt"
		gff3_params={}

		#Test TODO
		gff3=""
		if os.path.isfile(file_dir+"Processed/"+file):
			gff3=open(file_dir+"Processed/"+file,"r")
		elif os.path.isfile(file_dir+"TODO/"+file):
			gff3=open(file_dir+"TODO/"+file,"r")
		else:
			print("[SPECIES] - Downloading from miRBase...")
			url="ftp://mirbase.org/pub/mirbase/CURRENT/genomes/%s.gff3" %(self.specie[4])
			response=""
			try:
				response=request.urlopen(url)
			except error.URLError:
				print(url)
				print("[SPECIES] - %sFailure!%s - Error downloading gff3 file! Terminating" %(bc.FAIL,bc.ENDC))
				exit(1)
			response=request.urlopen(url)
			parsed_response=response.read().decode("utf-8")
			fw=open(file_dir+"TODO/"+file,"w")
			fw.write(parsed_response)
			fw.flush()
			fw.close()
			gff3=open(file_dir+"TODO/"+file,"r")
		
		for line in gff3:
			if line[0]=="#":
				match=re.match(".*:.*",line)
				if match:
					(key,value)=match[0].split(":",1)
					key=key.replace("#","").strip()
					value=value.strip()
					gff3_params[key]=value
			else:
				break
		self.gff3_params=gff3_params
		if debug:
			print("[SPECIES] - Extracted gff3 params:")
			print(gff3_params)
		return gff3.name

	def genomeData(self,gca,debug=False):
		genome={}
		url="https://www.ebi.ac.uk/ena/data/view/%s&display=xml" %(gca)
		response=""
		try:
			response=request.urlopen(url)
		except error.URLError:
			print(url)
			print("[SPECIES] - %sFailure!%s - Error downloading xml file! Terminating" %(bc.FAIL,bc.ENDC))
			exit(1)
		parsed_response=response.read().decode("utf-8")
		root=ET.fromstring(parsed_response)
		if re.match(".*display type is either not supported or entry is not found",root.text.strip()):
			print(root.text.strip())
			print("[SPECIES] - %sFailure!%s - Program terminated!" %(bc.FAIL,bc.ENDC))
			exit(1)
		else:
			if root.find('ASSEMBLY').find('TAXON').find('TAXON_ID').text==self.specie[3]:
				print("[SPECIES] - Taxons match!")
			else:
				print("[SPECIES] - Taxons do not match!")
				print("[SPECIES] - Assembly TAXON: "+root.find('ASSEMBLY').find('TAXON').find('TAXON_ID').text)
				print("[SPECIES] - Organism Taxon: "+self.specie[3])

			genome["assembly_value"]=root.find('ASSEMBLY').find('IDENTIFIERS').find('PRIMARY_ID').text.strip()
			if genome["assembly_value"][0:3]=="GCA":
				genome["assembly_key"]="NCBI_Assembly"
			else:
				genome["assembly_key"]=""
			
			genome["external_id_value"]=root.find('ASSEMBLY').find('SAMPLE_REF').find('IDENTIFIERS').find('PRIMARY_ID').text.strip()
			if genome["external_id_value"][0:3]=="SAM":
				genome["external_id_key"]="BioSample"
			else:
				genome["external_id_key"]=""

			genome["project_value"]=root.find('ASSEMBLY').find('STUDY_REF').find('IDENTIFIERS').find('PRIMARY_ID').text.strip()
			if genome["project_value"][0:3]=="PRJ":
				genome["project_key"]="bioproject"
			else:
				genome["project_key"]=""

			genome["genome_build"]=root.find('ASSEMBLY').find('NAME').text
			genome["organism_id"]="None"

			if debug:
				print(genome)
			self.data_genome=genome

	def add_organism(self):
		self.insert_organism=(
			"INSERT INTO Organism"
			"(abbreviation,common_name,genus,specific_name,ncbi_taxon_id)"
			"VALUES (%(abbreviation)s,%(common_name)s,%(genus)s,%(specific_name)s,%(ncbi_taxon_id)s)"
			)

	def add_genome(self):
		self.insert_genome=(
			"INSERT INTO Genome"
			"(organism_id,assembly_value,assembly_key,external_id_key,external_id_value,project_key,project_value,genome_build)"
			"VALUES (%(organism_id)s,%(assembly_value)s,%(assembly_key)s,%(external_id_key)s,%(external_id_value)s,%(project_key)s,%(project_value)s,%(genome_build)s)"
			)

