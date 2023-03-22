const {getPerson} = require('./../auth/authorize')
const {getRoles} = require('./../auth/roles')
const db = require('./../miRNADB/sqldb/index');


async function getManagedStudies(personId){
    let managed_studies= await db['Managed_by'].findAll({include:[{
            model: db.Study,
            include: [{
                model:db.Assay
            }]
    }]})
    let studies=managed_studies.map(managed_by=>managed_by.Study)
    return studies
}


module.exports = async function (req,res,next){
    try{
        let roles=await getRoles(req,res,next)
        if(roles.includes("admin")){
            let studies=await db['Study'].findAll()
            res.json(studies)
        }else if(roles.includes("curator")){
            let studies=await db['Study'].findAll()
            res.json(studies)
        }else{
             //researcher
            let person=await getPerson(req,res)
            let studies=await getManagedStudies(person.person)
            res.json(studies)
        }

    }catch (e) {

    }

}