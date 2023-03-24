const db = require('./../miRNADB/sqldb')


module.exports = function(tableName,where){
    return db[tableName].findAll({where})
}