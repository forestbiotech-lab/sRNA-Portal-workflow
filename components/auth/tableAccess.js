const db = require('./../miRNADB/sqldb')
async function publicTable(req,res,next){
    try {
        let tableName = req.params.table
        let result = await db.Table_access.findAll({where: {name: tableName}})
        if (result[0].name===tableName) next()
        else throw Error("Not_authorized")
    }catch (e) {
        //TODO improve messaging
        if(req.method=="GET") res.render('error',e)
        res.json(e)
    }
}

module.exports={
    publicTable
}