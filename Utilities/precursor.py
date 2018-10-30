from database import Database as db
import re

class Precursor:
	def __init__(self,abbr,miRNA_list):
		self.precursors=[ {"accession" :x[0],
			"name": x[1], 
			"sequence": x[3] 
		  } for x in miRNA_list if x[1][0:3]==abbr]			

	def get_sequences(self):
		self.sequences=dict([[pre["sequence"],""]for pre in self.precursors]).keys()

	def add_sequence(self):
		self.sequence_structure=("call addPreSequence(\"%s\")")

	def insert_sequences(self,debug=False):
		self.get_sequences()
		self.add_sequence()
		self.db=db()
		for seq in self.sequences:
			if debug:
				self.db.prettyPrint(self.sequence_structure, seq)
			self.db.execute(self.sequence_structure %(seq))
		self.db.commit()
		self.db.close()

	def add_precursor(self):
		self.precursor_structure=("INSERT INTO `Pre_miRNA`" 
			"(`accession`,`name`,`family`,`lettered_suffix`,`numbered_suffix`,`feature_id`,`sequence_id`)"
			"VALUES (%(accession)s,%(name)s,%(family)s,%(lettered_suffix)s,%(numbered_suffix)s, "
			 "(SELECT id FROM Feature WHERE attr_id=%(accession)s),"
			 "(SELECT id FROM Pre_miRNA_sequence WHERE sequence=%(sequence)s)"
			")"
			)

	def insert_precursors(self,debug=False):
		self.add_precursor()
		self.db=db()
		for pre in self.precursors:
			(pre["family"],pre["lettered_suffix"],pre["numbered_suffix"])=re.match("[a-z]{3}-MIR([0-9]*)([a-z]*)(.*)",pre["name"]).groups()
			if debug:
				self.db.prettyPrint(self.precursor_structure, pre)
			self.db.insertData(self.precursor_structure, pre)
		self.db.commit()
		self.db.close()