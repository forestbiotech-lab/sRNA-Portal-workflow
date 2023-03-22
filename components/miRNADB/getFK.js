const db=require('./sqldb')
const Datatypes=require('sequelize/lib/data-types')

module.exports = function(tableName){
    return db[tableName].findOne({include:{all:true}}).then(data=>{
        data.fks=[]
        //iterate
        data.fks=data._options.include.map(associate=> {
            return {
                targetTable: associate.association.associationAccessor,
                foreignKey: associate.association.options.foreignKey,
                targetKey: associate.association.options.targetKey
            }
        })
        return data
    })
}