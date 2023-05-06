const db = require('./../miRNADB/sqldb/index');
const Cookies = require("cookies");
var Keygrip = require("keygrip");
var keylist=require('./../../.config_res').cookie.keylist
var keys = new Keygrip(keylist,'sha256','hex')

async function getPerson(req,res){
    let cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
    let email=cookies.get('email',{signed:true})
    //TODO switch to EMAIL on User Pk update
    let person=await db['User'].findOne({include:[{model: db.Person}],where: {email}})
    //Removes most user attributes like hash
    person=Object.assign({email,role:person.dataValues.role},person.dataValues.Person.dataValues)
    return {person,res}

}

module.exports={
    getPerson,
}