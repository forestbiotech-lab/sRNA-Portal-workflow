var db = require('./../sqldb/index');

var e = {}

e.getTableValuesWhere=function(attributes){
  return db[attributes.tablename].findAll({
      where:attributes.where
    },{transaction:attributes.transaction}).then(function(res){
    return res
  }).catch(function(err){
    console.log(`getTableValuesWhete for table [${attributes.tablename}] - Err:${err}`)
  })
}

e.saveSingleTableDynamic = function(attributes) {
    return db[attributes.tablename].create(attributes.inserts,{transaction:attributes.transaction})
}


module.exports=e