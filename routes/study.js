var express = require('express');
var router = express.Router();
var octicons = require("@primer/octicons")

var Cookies = require('cookies');
var Keygrip = require("keygrip");
const keylist = require('./../.config_res').cookie.keylist
var keys = new Keygrip(keylist,'sha256','hex')
const Auth =  require('node_auth_module')
const authModule=new Auth(".config_auth.js")

async function authenticate(req,res,next){
  var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
  let sessionId=cookies.get('session-id')
  let userId=cookies.get('user-id',{signed:true})
  let accessToken=cookies.get('accessToken',{signed:true})
  let validate=await authModule.session.validateSession(sessionId,accessToken)
  if(validate instanceof Error) {
    res.redirect("/")
  }else if(validate==true){
    next()
  }else{
    res.redirect("/")
  }
}

router.get('/overview',(req,res)=>{
  res.render('study/overview',{title:"Study overview"})
})



module.exports=router


