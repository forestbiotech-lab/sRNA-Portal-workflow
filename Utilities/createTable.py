#!/usr/bin/env python3

######################################
# Created by "Bruno Costa"@INESC
#    2023/03/06
#  for table in Mature_miRNA HasStar Feature Pre_miRNA Gene Genome Protein Organism Target Transcript; do Utilities/./createTable.py $table > components/miRNADB/sqldb/${table}.js;done
#
# Usage: createTable.py [table] [file]
# Usage: createTable.py all [file]
# Using with no table generates for all
#
# mysqldump -u [user] -h [host] -p [database]--no-data
#
# -Adds a verification for views
# -Allows multiple PKs
# -Better detection of foreignKeys
#
######################################


import re
import sys
import os
import gzip
import zipfile
from operator import itemgetter
import datetime

x = datetime.datetime.now()

dir_path = os.path.dirname(os.path.realpath(__file__))
sqlFile = dir_path + "/../SQL/LATEST_dump.sql"

# Change this based on your project
variable_path = "components/miRNADB"

tables = []

if len(sys.argv) == 2:
    tables = [sys.argv[1]]
elif (len(sys.argv) == 3):
    if ([sys.argv[1]] != "all"):
        tables = [sys.argv[1]]

    sqlFile = sys.argv[2]
else:
    tables = []


def openSQLfile(file):
    f = re.compile('\.[a-zA-Z]+$')
    ext = f.findall(file)
    ext = ext[0]
    if (ext == ".zip"):
        archive = zipfile.ZipFile(file, 'r')
        firstFile = archive.namelist()[0]
        print(f"Opened first file in zip archive: {firstFile}")
        return archive.open(firstFile)
    elif (ext == ".gzip"):
        return gzip.open(file, 'rb')
    else:
        return open(file, 'r')


def loadContraints():
    sql = openSQLfile(sqlFile)
    extract = False
    alter = False
    foreignKeys = {}
    table = "unassigned"
    for line in sql.readlines():
        # line=line.decode('utf-8').strip()

        match = re.match(r"DROP TABLE IF EXISTS `(.*)`;", f"{line}")
        if (match):
            table = match.group(1)
            try:
                test = foreignKeys[table]
            except KeyError:
                foreignKeys[table] = []
            continue

        if (re.search("CREATE TABLE ", line)):
            extract = True
            continue

        if (extract and re.match("\).*\;", line)):
            extract = False
            continue

        if (extract and re.search("ADD KEY", line)):
            # Its a key add unique check what could be added
            fk = line.strip().split("`")


        if (extract and re.search("\s*CONSTRAINT", line)):
            # fk = line.strip().split("`")
            fks = re.findall("`(\w*)`", re.search("FOREIGN KEY\s*\((.*)\) REFERENCES", line)[1])
            targetTable = re.search("REFERENCES `(\w*)`", line)[1]
            targetKeys = re.findall("`(\w*)`", re.search("REFERENCES `\w*` \((.*)\)", line)[1])

            # (0)CONSTRAINT `
            # (1)Pre_miRNA_fk2`
            # (2) FOREIGN KEY (`
            # (3)sequence_id`
            # (4)) REFERENCES `
            # (5)Pre_miRNA_sequence`
            # (6) (`
            # (7)id`)
            # IF attr is pk on table it oneToMany

            constraintOUT = {
                'direction': "OUT",
                'foreignKey': fks, #fk[3]
                'table': table,
                'targetKey': targetKeys, #fk[7],
                'targetTable': targetTable, #fk[5]
            }
            constraintIN = {
                'direction': "IN",
                'foreignKey': targetKeys, #fk[7],
                'table': targetTable, #fk[5],
                'targetKey': fks, #fk[3],
                'targetTable': table
            }
            foreignKeys[table].append(constraintOUT)
            inTable = constraintIN['table']
            try:
                foreignKeys[inTable].append(constraintIN)
            except KeyError:
                foreignKeys[inTable] = [constraintIN]

        match = re.match("ALTER TABLE `(.*)`", line)
        if (match):
            table = match.group(1)
            extract = True
            try:
                test = foreignKeys[table]
            except KeyError:
                foreignKeys[table] = []
            continue

        if re.match("^.*;$", line):
            alter = False
            extract = False

    return foreignKeys

def loadViews():
    sql = openSQLfile(sqlFile)
    views = {}
    for line in sql.readlines():
        line = line.strip()
        if re.search("CREATE.*VIEW", line):
            tableName=re.search('VIEW `(\w*)`',line)[1]
            composite = re.search('concat\(.*`\) AS `(\S*)` ', line)[1]
            tableOrigin = re.search("FROM `(\w*)`",line)[1]

            views[tableOrigin] = {"composite": composite, "tableName": tableName}
    return views

def generateTable(table: str, output: str, foreignKeys: dict, views: dict) -> None:
    sql = openSQLfile(sqlFile)
    view = False
    real_table_name = table


    tableAttributes = {}
    extract = False
    alter = True

    for line in sql.readlines():
        line = line.strip()
        if ( extract and re.match("\).*\;", line) ):
            extract = False
            continue

        if (extract and not re.search("KEY|CONSTRAINT|PRIMARY|UNIQUE|MODIFY", line)):
            ##Attributes
            parsed = line.strip().strip(',').replace("`", "").split(" ")
            #print(parsed[0:2])
            attribute = parsed[0]
            autoincrement = bool(re.search("AUTO_INCREMENT", line)) == True
            allowNull = not bool(re.search("NOT NULL", line)) == True
            datatype = parsed[1].replace("tinyint", "TINYINT").replace("int", "INTEGER").replace("varchar",
                                                                                                 "STRING").replace(
                "datetime", "DATE").replace("date", "DATE").replace("text", "TEXT").replace("float", "FLOAT").replace(
                "enum", "ENUM").replace("binary", "TINYINT")
            tableAttributes[attribute] = {'attribute': parsed[0], 'pk': "false", 'datatype': datatype,
                                          'allowNull': str(allowNull).lower(),
                                          'autoincrement': str(autoincrement).lower()}
            #print(tableAttributes)
            #ISSUE with enum if values have space use underscore?

        if (re.match("CREATE TABLE `" + table + "`", line)):
            extract = True
            # If table has view replace with view
            if table in views.keys():
                table = views[table]['tableName']
                view = True


        if extract and re.search("PRIMARY KEY", line):
            attributes = re.findall("`(\w*)`", line)
            #print(tableAttributes[attribute])
            for attribute in attributes:
                tableAttributes[attribute]["pk"] = "true"

        if view:
            if re.match("ALTER TABLE `" + real_table_name + "`", line):
                extract = True

        if re.match("ALTER TABLE `" + table + "`", line):
            extract = True

        if (re.match("^.*;$", line)):
            alter = True
            extract = False


    sql.close()

    my_dict = {'table': table}
    my_dict['date'] = x.strftime("%Y-%m-%d")

    result = """/**
   * Created by Bruno Costa %(date)s
   * Generated by Utilities/createTable.py
   */
  'use strict';

  module.exports = function(sequelize, DataTypes) {
    const %(table)s = sequelize.define('%(table)s', {\n""" % my_dict
    #print(tableAttributes)
    if view:
        composite_attribute = views[real_table_name]['composite']
        tableAttributes[composite_attribute] = {
            'attribute': composite_attribute,
            'pk': 'false',
            'datatype': 'STRING',
            'allowNull': 'false',
            'autoincrement': 'false'
        }

        def determineCompositeOptions(tableFKs: list, tableAttributes: dict, composite_attribute: str)->None:
            for fk in tableFKs:
                if len(fk['foreignKey']) > 1:
                    for option in list(tableAttributes[composite_attribute])[1::]:
                        currentValue='false'
                        for attribute in fk['foreignKey']:
                            attrValue=tableAttributes[attribute][option]
                            if attrValue == 'true' or attrValue == 'false':
                                if attrValue != currentValue:
                                    currentValue = 'true' #only works for two
                            else:
                                #TODO Do something for datatype
                                currentValue = "STRING"
                                continue
                        tableAttributes[composite_attribute][option] = currentValue
                    continue

        tableFKs=foreignKeys[real_table_name]
        determineCompositeOptions(tableFKs, tableAttributes, composite_attribute)


    for key in tableAttributes.keys():
        attr = tableAttributes[key]
        # enum must not have spaces.
        result += """      %(attribute)s: {
        type: DataTypes.%(datatype)s,
        autoIncrement: %(autoincrement)s,
        primaryKey: %(pk)s,
        allowNull: %(allowNull)s
      },\n""" % attr

    result += """    }, {
      tableName: '%(table)s',
      timestamps: false,
      underscored: false,

      classMethods: {
        associate: function associate(models) {    """ % my_dict

    ###Add ForeignKeys
    try:
        for fk in foreignKeys[real_table_name]:
            if len(fk['foreignKey']) > 1:
                fk['table'] = views[real_table_name]['tableName']
                fk['foreignKey'] = views[real_table_name]['composite']
                fk['targetKey'] = views[fk['targetTable']]['composite']
                fk['targetTable'] = views[fk['targetTable']]['tableName']
            else:
                fk['foreignKey'] = fk['foreignKey'][0]
                fk['targetKey'] = fk['targetKey'][0]
                if fk['targetTable'] in views.keys():
                    fk['targetTable'] = views[fk['targetTable']]['tableName']

                if view:
                    fk['table'] = views[real_table_name]['tableName']
            # If the attributes are not PKs then it should be a:toMany()
            result += """
              %(table)s.belongsTo(models.%(targetTable)s, {
                foreignKey: '%(foreignKey)s',              //on %(table)s
                targetKey: '%(targetKey)s',  //foreign key
              });""" % fk
    except KeyError:
        print("No fk found for this table")
    result += """
        }
      },
    });

    return %(table)s;
  };""" % my_dict

    print(result)
    print(output)
    fw = open(output, "w")
    fw.write(result)
    fw.flush()
    fw.close()


if (len(tables) == 0):
    sql = openSQLfile(sqlFile)
    for line in sql.readlines():
        line = line.strip()
        match = re.match(r"DROP TABLE IF EXISTS `(.*)`;", f"{line}")
        if (match):
            tables.append(match.group(1))
    sql.close()

views = loadViews()
foreignKeys = loadContraints()

for table in tables:
    current_table = {'table': table}
    output = dir_path + "/../" + variable_path + "/sqldb/%(table)s.js" % current_table
    generateTable(table, output, foreignKeys, views)
