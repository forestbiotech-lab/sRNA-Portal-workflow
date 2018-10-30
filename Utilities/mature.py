import re
from database import Database as db

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

	def get_sequences(self):
		self.sequences=dict([[miRNA["sequence"],""] for miRNA in self.mature]).keys()

	def add_sequence(self):
		self.sequence_structure=("INSERT IGNORE INTO Mature_miRNA_sequence (`sequence`) VALUE (%(sequence)s)")

	def insert_sequences(self,debug=False):
		self.get_sequences()
		self.add_sequence()
		self.db=db()
		for seq in self.sequences:
			if debug:
				self.db.prettyPrint(self.sequence_structure, {"sequence": seq})
			self.db.insertData(self.sequence_structure, {"sequence": seq})
		self.db.commit()
		self.db.close()

	def add_mature(self):
		self.mature_structure=("INSERT INTO `Mature_miRNA`" 
			"(`accession`,`name`,`arm`,`family`,`lettered_suffix`,`numbered_suffix`,`feature_id`,`sequence_id`,`pre_miRNA_id`)"
			"VALUES (%(accession)s,%(name)s,%(arm)s,%(family)s,%(lettered_suffix)s,%(numbered_suffix)s, "
			 "(SELECT id FROM Feature WHERE attr_id=%(accession)s),"
			 "(SELECT id FROM Mature_miRNA_sequence WHERE sequence=%(sequence)s),"
			 "(SELECT id FROM Pre_miRNA WHERE accession=%(pre_acc)s)"
			")"
			)

	def insert_mature(self,debug=False):
		self.add_mature()
		self.db=db()
		for miRNA in self.mature:
			if debug:
				self.db.prettyPrint(self.mature_structure, miRNA)
			self.db.insertData(self.mature_structure, miRNA)
		self.db.commit()
		self.db.close()

