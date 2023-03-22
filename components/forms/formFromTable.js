var db=require('./../miRNADB/sqldb')
var models=require('./models')
var glob=require('glob')
var fs=require('fs')

let inputType={
  INTEGER:"number",
  FLOAT:"number",
  STRING:"text",
  DATE:"date",
  BOOLEAN:"checkbox",
  TEXT:"text",
  FK:"select",
  TINYINT:"checkbox"
}


function searchForTableMetadata(table){
  table=table.toLowerCase()
  let tableMetadata=glob.sync(`${__dirname}/../miRNADB/sqldb/${table}.json`)
  if(tableMetadata.length==1){
    let metadata=fs.readFileSync(tableMetadata[0],"utf8")
    return JSON.parse(metadata)
  }else{
    return null
  }
}


function ts(table){
  let tableStructure=[]
  let tableMetadata=searchForTableMetadata(table)
  if (db[table]==undefined) throw new Error(`This table [${table}] does not exist!`);
  //if(tableMetadata!=null) 
  var associations=db[table].associations
  var tableAttributes=db[table].tableAttributes
  Object.keys( tableAttributes ).forEach(function(attribute){
    fk=isAttrAFK(attribute,associations)
    let type= fk.targetKey==null ? tableAttributes[attribute].type.key : "FK"
    let metadata=null
    if(tableMetadata) if(tableMetadata[attribute]) metadata=tableMetadata[attribute]
    tableStructure.push({name:attribute, type:inputType[type], fk, metadata })
  })
  return tableStructure
}

function te(options){
  call="getTableValueById"
  return models[call](options)
}

function isAttrAFK(attr,associations){
  let result={targetKey:null,targetTable:null,values:[]}
  if(Object.keys(associations).length==0 || attr=='id'){
    return result
  }else{
    Object.keys(associations).forEach(targetTable=>{
      let options=associations[targetTable].options
      if(options.foreignKey==attr){
        result.targetKey=options.targetKey
        result.targetTable=targetTable
      }
    })
    return result
  }
}




module.exports={
  tableStructure:ts,
  tableEntry:te,
}