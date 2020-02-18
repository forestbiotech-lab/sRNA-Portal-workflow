var db=require('./../miRNADB/sqldb')
var models=require('./models')

let inputType={
  INTEGER:"number",
  FLOAT:"number",
  STRING:"text",
  DATE:"date",
  BOOLEAN:"checkbox",
  TEXT:"text",
  FK:"select"
}





function ts(table){
  let tableStructure=[]
  if (db[table]==undefined) throw new Error(`This table [${table}] does not exist!`);
  var associations=db[table].associations
  var tableAttributes=db[table].tableAttributes
  Object.keys( tableAttributes ).forEach(function(attribute){
    fk=isAttrAFK(attribute,associations)
    let type= fk.targetKey==null ? tableAttributes[attribute].type.key : "FK"
    tableStructure.push({name:attribute, type:inputType[type], fk })
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