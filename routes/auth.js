const express = require('express');
const router = express.Router();
const Auth =  require('node_auth_module')
const authModule=new Auth(".config_auth.js")
var Cookies = require('cookies');
var Keygrip = require("keygrip");
var keylist=require('./../.config_res').cookie.keylist
var keys = new Keygrip(keylist,'sha256','hex')
var token=require('./../.config_res').cookie.seed

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

router.get('/profile',function(req,res,next){
  res.render('auth/profile',{})
})

router.get('/login',function(req,res,next){
  res.render('auth/login',{})
})

router.post('/login',function(req,res){
  let email=req.body.email
  let password=req.body.password
  authModule.auth.validateLogin(email,password,callback)
  function callback(error,id){
    if(error){
      res.render('auth/login',{error}) 
    }else{
      res.redirect('/de')
    }
  }
//  var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
//  let person_id=1
//  cookies.set( "person_id", person_id ).set( "person_id", person_id, { signed: true, maxAge: (1000 * 60 * 60 * 24 * 30 ) } ); //sec * min * hour * day * month  

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
    authModule.auth.activateUser()
  }else{
    authModule.auth.inactivateUser()
  }
})
router.post('/ban',async function(req,res){
  let newState=req.body.newState
  let userId=req.body.userId
  if(newState==true){ 
    let result=await authModule.auth.banUser()
    res.json(result)
  }else{
    let result=await authModule.auth.unbanUser()
    res.json(result)
  }
})

module.exports = router;