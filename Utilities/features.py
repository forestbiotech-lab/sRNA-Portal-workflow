from database import Database

class Features:
	def __init__(self,feature_file):
		self.feature=open(feature_file,"r")

	def process(self,genome_id,debug=False):
		self.connectDB()
		self.add_feature()
		self.add_attribute_list()
		for l in self.feature:
			if l[0] is not "#":
				(data,attribute_list)=self.parse(l)
				data["genome_id"]=genome_id
				if debug:
					print(self.feature_structure %(data))
				feature_id=self.db.insertData(self.feature_structure,data)
				self.insert_attribute_list(feature_id,attribute_list)
		self.db.commit()
		self.db.close()

	def connectDB(self):
		self.db=Database()

	def add_feature(self):
		self.feature_structure=("INSERT INTO Feature" 
		"(genome_id,name,source,type,start,end,score,strand,phase,attr_id)"
		"VALUES (%(genome_id)s,%(name)s,%(source)s,%(type)s,%(start)s,%(end)s,%(score)s,%(strand)s,%(phase)s,%(attr_id)s)"
		) 

	def add_attribute_list(self):
		self.attribute_list_structure=("INSERT INTO `Feature_attribute_list`" 
		"(`feature_id`,`key`,`value`) "
		"VALUE (%(feature_id)s,%(key)s,%(value)s)"
		) 

	def parse(self,feature):
		l=feature.split("\t")
		data={}
		data["genome_id"]=""
		data["name"]=l[0]
		data["source"]="miRBase"
		data["type"]=l[2]
		data["start"]=l[3]
		data["end"]=l[4]
		data["score"]=l[5]
		data["strand"]=l[6]
		data["phase"]=l[7]
		attribute_list=l[8].split(";")
		data["attr_id"]=attribute_list[1].split("=")[1]
		return [data,attribute_list]

	def insert_attribute_list(self,feature_id,attribute_list,debug=False):
		data=[{"feature_id":feature_id,"key":f.split("=")[0],"value":f.split("=")[1]} for f in attribute_list]  
		for d in data:
			if debug:
				print(self.attribute_list_structure %(d))
			self.db.insertData(self.attribute_list_structure, d)

