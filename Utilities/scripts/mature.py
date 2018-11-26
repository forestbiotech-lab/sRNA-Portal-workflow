import re
from scripts.database import Database as db
from scripts.features import Features as feature
from scripts.precursor import Precursor as precursor

class Mature:
	def __init__(self,abbr,miRNA_list):
		self.mature=[]
		for miRNA in miRNA_list:
			d={}
			if miRNA[1][0:3]==abbr:
				d["pre_acc"]=miRNA[0]
				miRNA.pop(1) #pre-id
				miRNA.pop(1) #pre-Status
				miRNA.pop(1) #Pre-seq
				while len(miRNA)>1:
					d["accession"]=miRNA.pop(1)
					d["name"]=miRNA.pop(1)
					d["sequence"]=miRNA.pop(1)
					match=re.match("[a-z]{3}-miR([0-9]*)([a-z]*)([0-9]*)-*([53p]*)",d["name"])
					if match:
						(d["family"],d["lettered_suffix"],d["numbered_suffix"],d["arm"])=match.groups()
				self.mature.append(d)
		
		self.mature_pre_feature=("INSERT INTO `Mature_has_Pre`"
			"(`mature_miRNA_id`,`pre_miRNA_id`,`feature_id`)"
			"VALUE (%(mature_miRNA_id)s,%(pre_miRNA_id)s,%(feature_id)s)"
			)
		self.sequence_structure=("INSERT IGNORE INTO Mature_miRNA_sequence (`sequence`) VALUE (%(sequence)s)")
		self.mature_structure=("INSERT INTO `Mature_miRNA` " 
			"(`accession`,`name`,`arm`,`family`,`lettered_suffix`,`numbered_suffix`,`sequence_id`) "
			"VALUES (%(accession)s,%(name)s,%(arm)s,%(family)s,%(lettered_suffix)s,%(numbered_suffix)s, "
			 "(SELECT id FROM Mature_miRNA_sequence WHERE sequence=%(sequence)s)"
			")"
			)


	def get_sequences(self):
		self.sequences=dict([[miRNA["sequence"],""] for miRNA in self.mature]).keys()

	def insert_sequences(self,debug=False):
		self.get_sequences()
		self.db=db()
		counter=0
		startId=""
		endId=""
		for seq in self.sequences:
			counter+=1
			if debug:
				self.db.prettyPrint(self.sequence_structure, {"sequence": seq})
			currentID=self.db.insertData(self.sequence_structure, {"sequence": seq})
			if counter==1:
				startId=currentID	
		self.db.commit()
		self.db.close()
		endId=currentID
		print("A total of %s sequences were added!" %(endId-startId))

	def link2pre_feature(self,miRNA,debug=False):
		features=feature.getFeaturesFromAccession(self,miRNA)
		miRNA["pre_miRNA_id"]=precursor.getPrecursorsFromAccession(self,miRNA)[0][0]
		for feature_id in features:
			miRNA["feature_id"]=feature_id[0]
			if debug:
				self.db.prettyPrint(self.mature_pre_feature, miRNA)
			self.db.insertData(self.mature_pre_feature, miRNA)

	def insert_mature(self,debug=False):
		self.db=db()
		for miRNA in self.mature:
			if debug:
				self.db.prettyPrint(self.mature_structure, miRNA)
			miRNA["mature_miRNA_id"]=self.db.insertData(self.mature_structure, miRNA)
			self.link2pre_feature(miRNA,debug)
		self.db.commit()
		self.db.close()
