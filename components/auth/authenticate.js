const Auth =  require('node_auth_module')
const authModule=new Auth(".config_auth.js")
const Cookies = require("cookies");
var Keygrip = require("keygrip");
var keylist=require('./../../.config_res').cookie.keylist
var keys = new Keygrip(keylist,'sha256','hex')
async function authenticate(req,res,next){
    var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
    let sessionId=cookies.get('session-id')
    let accessToken=cookies.get('accessToken',{signed:true})
    try{
        let validate=await authModule.session.validateSession(sessionId,accessToken)
        if(validate instanceof Error) {
            res.redirect("/")
        }else if(validate==true){
            next()
        }else{
            res.redirect("/")
        }
    }catch(err){
        res.redirect("/")
    }
}
async function loggedin(req,res) {
    var cookies = new Cookies(req, res, {"keys": keys}), unsigned, signed, tampered;
    let sessionId = cookies.get('session-id')
    let accessToken = cookies.get('accessToken', {signed: true})
    let gPicture = cookies.get('gPicture', {signed: true})
    try {
        let validate = await authModule.session.validateSession(sessionId, accessToken)
        if (validate == true) {
            res.json({logged: true, gPicture})
        } else {
            throw Error("invalid")
        }
    } catch (err) {
        res.json({logged: false})
    }
}

module.exports={authenticate,loggedin}