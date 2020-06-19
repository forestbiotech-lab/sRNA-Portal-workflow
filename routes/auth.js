const express = require('express');
const router = express.Router();
const Auth =  require('node_auth_module')
const authModule=new Auth(".config_auth.js")
var Cookies = require('cookies');
var Keygrip = require("keygrip");
var keylist=require('./../.config_res').cookie.keylist
var keys = new Keygrip(keylist,'sha256','hex')
var token=require('./../.config_res').cookie.seed


//This is a function that must be packaged elsewhere afterwards
function getCityAndCountry(ipv4){
  return new Promise((res,rej)=>{
    res({
      city:null,
      country:null
    })
  })
}
///
async function authenticate(req,res,next){
  var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
  let sessionId=cookies.get('session-id')
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


/* GET sequences search */
router.get('/register', function(req, res, next) {
  res.render('auth/register', {})  
});

router.post('/register', async function(req, res, next) {
  let firstName=req.body.firstName
  let lastName=req.body.lastName
  let orcid=req.body.orcid
  let email=req.body.email
  let password=req.body.password
  let result=await authModule.auth.register(firstName,lastName,email,password)
  if (result instanceof Error){
    res.render('auth/register', {error:result})     
  }else{
    res.redirect('/de')
  }
  
});

router.get('/list/users', function(req, res, next) {
  authModule.auth.listUsers().then(data=>{
    data instanceof Error? res.render('error',{error:data}) : res.render('auth/users', {entries:data});
  }).catch(function(error){
    res.render('error',error)
  })  
});
router.post('/list/sessions',authenticate,async function(req,res){
  var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
  let userId=cookies.get('user-id',{signed:true})
  try{
    let sessions=await authModule.session.listSessions(userId)
    res.json(sessions)
  }catch(error){
    res.status(400).json(error)
  }
})
router.get('/profile',async function(req,res,next){
  var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
  let userId=cookies.get('user-id',{signed:true})
  let personId=null
  if(userId === undefined ){
    res.redirect('/')
  }else{
    let user=await authModule.auth.getUserMetadata(parseInt(userId))
    personId=user.person
  }
  let personInfo=await authModule.auth.getUserInfo(parseInt(userId))
  res.render('auth/profile',{personInfo});
})

router.get('/login',function(req,res,next){
  res.render('auth/login',{})
})

router.post('/login',function(req,res){
  let email=req.body.email
  let password=req.body.password
  authModule.auth.validateLogin(email,password,callback)
  async function callback(error,id){
    if(error){
      res.render('auth/login',{error}) 
    }else{
      try{
        let ipv4=null
        let ipv6 = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (ipv6.substr(0, 7) == "::ffff:") {
          ipv4 = ipv6.substr(7)
        }
        let valid=1
        let cityCountry=await getCityAndCountry(ipv4)
        let city=cityCountry.city
        let country=cityCountry.coutry
        let platform=req.headers['user-agent']
        let session=await authModule.session.saveSession(id,ipv4,ipv6,platform,valid,city,country)
        let personInfo=await authModule.auth.getUserInfo(id)
        let accessToken=session.accessToken
        let sessionId=session.id
        var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
        cookies.set("user-id",id).set("user-id",id,{ signed: true, maxAge: (1000 * 60 * 60 * 24 * 30 ) } ); //sec * min * hour * day * month  
        cookies.set("session-id",sessionId).set("session-id",sessionId, { signed: true, maxAge: (1000 * 60 * 60 * 24 * 30 ) } ); //sec * min * hour * day * month  
        cookies.set( "accessToken",accessToken).set( "accessToken", accessToken, { signed: true, maxAge: (1000 * 60 * 60 * 24 * 30 ) } ); //sec * min * hour * day * month  
        res.render('differential_expression',{personInfo,numOfStudies:0})
      }catch(error){
        res.render('auth/login',{error}) 
      }
    }
  }
})
router.get('/logout',function(req,res){
  var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
  cookies.set( "person_id",{expires: Date.now()}).set( "person_id", "",{ signed: true, maxAge: 0 } ); //sec * min * hour * day * month  
  res.redirect('/')
})
router.post('/active',function(req,res){
  let newState=req.body.newState
  let userId=req.body.userId
  if(newState==true){ 
    authModule.auth.activateUser(userId)
  }else{
    authModule.auth.inactivateUser(userId)
  }
})
router.post('/ban',async function(req,res){
  let newState=req.body.newState
  let userId=req.body.userId
  if(newState==true){ 
    let result=await authModule.auth.banUser(userId)
    res.json(result)
  }else{
    let result=await authModule.auth.unbanUser(userId)
    res.json(result)
  }
})

module.exports = router;