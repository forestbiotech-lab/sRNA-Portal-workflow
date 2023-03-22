const db = require('./../miRNADB/sqldb')


module.exports = function(tableName,pkColumn,pk){
    return db[tableName].findAll({where:{[pkColumn]:pk}})
}