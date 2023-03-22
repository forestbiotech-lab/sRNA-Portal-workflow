const Auth =  require('node_auth_module')
const authModule=new Auth(".config_auth.js")
const db = require('./../miRNADB/sqldb/index');


const Cookies = require("cookies");
var Keygrip = require("keygrip");
const {validate} = require("npm/lib/config/core");
var keylist=require('./../../.config_res').cookie.keylist
var keys = new Keygrip(keylist,'sha256','hex')
async function getRoles(req,res) {
    var cookies = new Cookies(req, res, {"keys": keys}), unsigned, signed, tampered;
    let roles =  cookies.get('roles',{ signed: true })
    let userId=cookies.get('user-id',{signed:true})
    if (roles !== undefined) {
        try{
            return JSON.parse(roles)
        }catch (e){
            displayToast("Error getting roles for user")
        }
    } else if(userId !== undefined) {
        roles=await loadRoles(userId)
        cookies.set("roles",JSON.stringify(roles)).set("roles",JSON.stringify(roles),{ signed: true, maxAge: (1000 * 60 ) } ); //sec * min * hour * day * month  )  //TODO opts
        return roles
    }else{
        res.redirect('/')
    }
}

async function loadRoles(userId){
    let roles = await db.Has_user_with_role.findAll({where: {user: userId}})
    if (roles=== null)
        return []
    else
        return roles.map(row=>row.role)
}
async function hasRequireRole(req,res,next,requiredRole) {
    let roles=await getRoles(req,res)
    let validations=roles.map(role=>validateRole(role,requiredRole))
    validations.includes(true)? next() : res.redirect("/")
}

function validateRole(requiredRole,grantedRoles){
    return grantedRoles.includes(requiredRole)? true : false
}


async function isAdmin(req,res,next){
    await hasRequireRole(req,res,next,"admin")
}
async function isCurator(req,res,next){
    await hasRequireRole(req,res,next, 'curator')
}


module.exports={isAdmin,isCurator,getRoles}