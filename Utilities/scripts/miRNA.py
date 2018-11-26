
from scripts.precursor import Precursor
from scripts.mature import Mature

class MiRNA:
	def __init__(self,list,abbr):
		self.list=[l.strip().split("\t") for l in open(list,"r")]
		self.abbr=abbr

	def extractPrecursors(self):
		self.precursors=Precursor(self.abbr,self.list)

	def insertPrecursors(self,debug=False):
		if self.precursors is not None:
			self.precursors.insert_sequences(debug)
			self.precursors.insert_precursors(debug)
			self.precursors.insert_precursors(debug)

	def extractMature(self):
		self.mature=Mature(self.abbr,self.list)

	def insertMature(self,debug=False):
		if self.mature is not None:
			self.mature.insert_sequences(debug)
			self.mature.insert_mature(debug)




