from scripts.database import Database as db
from scripts.features import Features as feature
import re

class Precursor:
	def __init__(self,abbr,miRNA_list):
		self.precursors=[ {"accession" :x[0],
			"name": x[1], 
			"sequence": x[3] 
		  } for x in miRNA_list if x[1][0:3]==abbr]			

		self.sequence_structure=("call addPreSequence(\"%s\")")
		self.pre_has_feature=("INSERT INTO `Pre_has_Feature` "
			"(`pre_miRNA_id`,`feature_id`) "
			"VALUE (%(pre_miRNA_id)s,%(feature_id)s)"
			)
		self.precursor_structure=("INSERT INTO `Pre_miRNA` " 
			"(`accession`,`name`,`family`,`lettered_suffix`,`numbered_suffix`,`sequence_id`) "
			"VALUES (%(accession)s,%(name)s,%(family)s,%(lettered_suffix)s,%(numbered_suffix)s,"
			 "(SELECT id FROM Pre_miRNA_sequence WHERE sequence=%(sequence)s)"
			")"
			)

	def get_sequences(self):
		self.sequences=dict([[pre["sequence"],""]for pre in self.precursors]).keys()

	def insert_sequences(self,debug=False):
		self.get_sequences()
		self.db=db()
		for seq in self.sequences:
			if debug:
				self.db.prettyPrint(self.sequence_structure, seq)
			self.db.execute(self.sequence_structure %(seq))
		self.db.commit()
		self.db.close()


	def link2feature(self,pre,debug=False):
		db=self.db
		features=feature.getFeaturesFromAccession(self,pre)
		for feature_id in features:
			pre["feature_id"]=feature_id[0]
			if debug:
				self.db.prettyPrint(self.pre_has_feature, pre)
			self.db.insertData(self.pre_has_feature, pre)

	@staticmethod		
	def getPrecursorsFromAccession(self,dictionary):
		query='SELECT id FROM Pre_miRNA WHERE accession="%(pre_acc)s"'
		return self.db.query(query %(dictionary))

	def insert_precursors(self,debug=False):
		self.db=db()
		for pre in self.precursors:
			(pre["family"],pre["lettered_suffix"],pre["numbered_suffix"])=re.match("[a-z]{3}-MIR([0-9]*)([a-z]*)(.*)",pre["name"]).groups()
			if debug:
				self.db.prettyPrint(self.precursor_structure, pre)
			pre["pre_miRNA_id"]=self.db.insertData(self.precursor_structure, pre)
			self.link2feature(pre,debug)
		self.db.commit()
		self.db.close()