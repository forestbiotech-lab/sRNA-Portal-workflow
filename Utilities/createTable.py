#!/usr/bin/env python3

######################################
# Created by "Bruno Costa"@INESC
#    2018/02/02
#  for table in Mature_miRNA HasStar Feature Pre_miRNA Gene Genome Protein Organism Target Transcript; do Utilities/./createTable.py $table > components/miRNADB/sqldb/${table}.js;done
#
######################################


import re
import sys
import os
from operator import itemgetter

dir_path = os.path.dirname(os.path.realpath(__file__))
sqlFile=dir_path+"/../SQL/LATEST_dump.sql"

#Change this based on your project
variable_path="components/miRNADB"

if len(sys.argv)==2:
  tables=[sys.argv[1]]
else:
  sql=open(sqlFile,"r")
  tables=[]
  for line in sql.readlines():
    line=line.strip()
    match=re.match(r"DROP TABLE IF EXISTS `(.*)`;",line)
    if(match):
      tables.append(match.group(1))
  sql.close()  
  






def generateTable(table,output):
  sql=open(sqlFile,"r")

  tableAttributes=[]
  foreignKeys=[]
  extract=False
  for line in sql.readlines(): 
    line=line.strip()
    if (extract and re.match("\).*\;",line)):
      extract=False
      continue
    
    if (extract and not re.match("KEY|CONSTRAINT|PRIMARY|UNIQUE",line)):
      ##Attributes  
      parsed=line.strip().replace("`","").split(" ")
      tableAttributes.append(parsed[0:2])
    if (extract and re.match("CONSTRAINT",line)):
      #Get foreignKeys outbound
      fk=line.strip().split("`")
      fk[0]="OUT"
      foreignKeys.append(itemgetter(*[0,3,5,7])(fk))
      
    if (not extract and re.match("CONSTRAINT.*REFERENCES `"+table+"`",line)):
      #Get foreignKeys inbound
      fk=line.strip().split("`")
      fk[0]="IN"
      fk[5]=fk[1].split("_fk")[0]
      foreignKeys.append(itemgetter(*[0,3,5,7])(fk))
    if (re.match("CREATE TABLE `"+table+"`",line)):
      extract=True
  sql.close()  

  my_dict={'table': table}

  result="""/**
   * Created by Bruno Costa 28-04-2018
   * Generated by Utilities/createTable.py
   */
  'use strict';

  module.exports = function(sequelize, DataTypes) {
    const %(table)s = sequelize.define('%(table)s', {
      id: { 
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },\n""" %my_dict
  for attribute, datatype in tableAttributes[1::]:
    attr={'attribute':attribute,'datatype':datatype.replace("int","INTEGER").replace("varchar","STRING").replace("date","DATE").replace("text","STRING").replace("float","FLOAT")}
    result+="    %(attribute)s: DataTypes.%(datatype)s,\n" % attr

  result+="""  }, {
      tableName: '%(table)s',
      timestamps: false,
      underscored: false,

     classMethods: {
        associate: function associate(models) {    """ % my_dict

  ###Add ForeignKeys
  for  direction, foreignKey, FKtable, targetKey in foreignKeys:
    if(direction=="OUT"):
      fk={'table': table, 'foreignKey': foreignKey, 'FKtable': FKtable, 'targetKey':targetKey} 
    else:
      fk={'table': table, 'targetKey': foreignKey, 'FKtable': FKtable, 'foreignKey':targetKey}     
    result+="""
          %(table)s.belongsTo(models.%(FKtable)s, {
            foreignKey: '%(foreignKey)s',              //on %(table)s
            targetKey: '%(targetKey)s',  //foreign key  
          });""" % fk
  result+=""" 
        }
      },
    });

    return %(table)s;
  };""" % my_dict

  print(result)
  print(output)
  fw=open(output,"w")
  fw.write(result)
  fw.flush()
  fw.close()

for table in tables:
  current_table={'table':table}
  output=dir_path+"/../"+variable_path+"/sqldb/%(table)s.js" %current_table
  generateTable(table,output)
