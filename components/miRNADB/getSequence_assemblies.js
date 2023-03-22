const db= require('./sqldb')

function getAssemblies(options){
    return db.Sequence_assembly_composite.findAll({})
}


module.exports=getAssemblies