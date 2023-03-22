const db = require('./../miRNADB/sqldb/index');
const Cookies = require("cookies");
var Keygrip = require("keygrip");
var keylist=require('./../../.config_res').cookie.keylist
var keys = new Keygrip(keylist,'sha256','hex')

async function getPerson(req,res){
    let cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
    let userId=cookies.get('user-id',{signed:true})
    let person=await db['Has_user_with_role'].findOne({where: {user: userId}})
    return person
}



module.exports={
    getPerson
}