var models=require('./models')
var call="countAssociatedTables"

module.exports=function(tablename,associatedTable,id){
  let options={
    tablename,
    associatedTable,
    where:id
  }  
  return models[call](options)
}

