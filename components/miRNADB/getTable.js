const db = require('./../miRNADB/sqldb')

module.exports = function(tableName,options){
    //TODO limiting options
    return db[tableName].findAll()
}