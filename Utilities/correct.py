#!/usr/bin/env python3
from database import Database as db
import re

class Correct:
	def __init__(self):
		self.db=db()

	def getIdsFromTable(self,table):
		query="SELECT id,name FROM %s " %(table)
		print(query)
		return self.db.query(query)

	def updateTable(self,table):
		parameters={"table":table}
		for (id,name) in self.getIdsFromTable(table):
			parameters['id']=id
			match=re.match("[a-z]{3}-miR([0-9]*)([a-z]*)\\.*([0-9]*)-*([53p]*)\\.*([0-9]*)",name)
			if match:
				(parameters["family"],parameters["lettered_suffix"],parameters["numbered_suffix"],parameters["arm"],parameters["numbered_suffix"])=match.groups()
				print(name)
				print(match.groups())
			#db.update(data,parameters)

c=Correct()
print(c.updateTable("Mature_miRNA"))