/**
 * Created by Bruno Costa on 12-09-2017.
 */

//Calls Index to load sql tables
var db = require('./../miRNADB/sqldb/index');

var e = {}

e.saveSingleTableDynamic = function(attributes) {
    return db[attributes.tablename].create(attributes.inserts).then(function(res) {
        return res
    }).catch(function(err) {
        console.log(`save single table dynamic table [${attributes.tablename}] - Err:${err}`)
        return err
    })
}
e.destroySingleTableDynamic = function(attributes) {
    return db[attributes.tablename].destroy({where:attributes.where}).then(function(res) {
        return res
    }).catch(function(err) {
        console.log(`destroy single table dynamic table [${attributes.tablename}] - Err:${err}`)
        return err
    })
}
e.updateSingleTableDynamic = function(attributes) {
    return db[attributes.tablename].update(attributes.inserts, attributes).then(function(res) {
        return res
    }).catch(function(err) {
        console.log(`save single table dynamic table [${attributes.tablename}] - Err:${err}`)
        return err
    })
}
e.formSelect = function(attributes) {
    return db[attributes.tablename].findAll({}).then(function(res) {
        return res
    }).catch(function(err) {
        console.log(`formSelect for table [${attributes.tablename}] - Err:${err}`)
        return err
    })
}
e.getTableValueById = function(attributes) {
    return db[attributes.tablename].findById(attributes.where.id).then(function(res) {
        return res
    }).catch(function(err) {
        console.log(`getTableValueById for table [${attributes.tablename}] - Err:${err}`)
        return err
    })
}
e.getTableValuesWhere= function(attributes){
  return db[attributes.tablename].findAll({
      where:attributes.where
    }).then(function(res){
    return res
  }).catch(function(err){
    console.log(`getTableValues for table [${attributes.tablename}] - Err:${err}`)
  })
}
module.exports = e
