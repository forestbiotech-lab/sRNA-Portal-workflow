#!/usr/bin/env python3

# Created by Bruno Costa on 26/09/2017 @iBET
#
# Uses a matrix file with the expressions
# Sequence annotation expression1 expression2 ....
#
# Test if sequence exists and add to database


import subprocess
import sys


matrixFile=sys.argv[1]
matrix=open(matrixFile,"r")
data=[i.strip().split("\t") for i in matrix if i.strip().split('\t')[1].startswith('m')]


def getLastRecord(table,pk):
	query="Select "+pk+" FROM "+ table +" ORDER BY "+pk+" DESC LIMIT 1";
	cmd=["mysql","-u","webapp","-D","sRNAPlantPortal","-pIqha0G#J7IH&A1^5","-s","-e",query]
	test = subprocess.Popen(cmd, stdout=subprocess.PIPE)
	return test.communicate()[0].decode().strip()

print(getLastRecord('Annotation','id'))

##This or using the mysql.connector directly
for seq in data:
	query="Select id FROM SRNA_sequence where sequence='"+seq[0]+"'";
	cmd=["mysql","-u","webapp","-D","sRNAPlantPortal","-pIqha0G#J7IH&A1^5","-s","-e",query]
	test = subprocess.Popen(cmd, stdout=subprocess.PIPE)
	output = test.communicate()[0].decode().strip()
	result=[line for line in output.strip().split("\n")]
	empty=['']
	if len(result[0])>0:
		print([line for line in output.strip().split("\n")])
		query="INSERT INTO Annotation (id,accession,name,,) VALUES "
	else:
		print("lklklk")

	
