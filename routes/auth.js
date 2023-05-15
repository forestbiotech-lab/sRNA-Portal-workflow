const express = require('express');
const router = express.Router();
const Auth =  require('node_auth_module')
const authModule=new Auth(".config_auth.js")
var Cookies = require('cookies');
var Keygrip = require("keygrip");
var keylist=require('./../.config_res').cookie.keylist
var keys = new Keygrip(keylist,'sha256','hex')
const token=require('./../.config_res').cookie.seed
const CLIENT_ID=require('./../.config_res').google.client_id
const {OAuth2Client} = require('google-auth-library');
const {authenticate,loggedin} = require('./../components/auth/authenticate')
const url=require("url")
const externalAuth=require('./../components/auth/externalAuth')
const getCityAndCountry = require('./../components/auth/procedures').getCityAndCountry
const LOGINREDIRECT="/auth/profile"
const {extractUserFromCookie,loginAction,setLoginMetadata} = require("./../components/auth/procedures")
const gmail=require('./../components/auth/gmail')
const getDomain=require('./../components/auth/getDomain')
const passwordRecoveryTemplate=require('./../components/emailTemplates/passwordRecovery')
//This is a function that must be packaged elsewhere afterwards




router.post('/callback',async function(req,res){
  let retry=1
  let login=await externalAuth.google(req,res)
  if(login instanceof Error || login == undefined){
    //Sends the error caught
    res.redirect(`/`,{error:login})
  }else{
    await setLoginMetadata(req,res,login)
    if(login.action=="json"){
      res[login.action](login.payload)
    }else if(login.action=="redirect"){
      if(login.path.match("/?")!=null) login.path+=`&retry=${retry}`
      res[login.action](`${login.path}&retry=${retry}`)
    }else{
      login.payload.retry=retry
      res[login.action](login.path,login.payload)
    }
  }
})

router.get('/loggedin', async function(req,res){
  loggedin(req,res)
})

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

router.get('/list/users',authenticate, function(req, res, next) {
  //Add condition to limit this to a specific scope. admin
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
router.get('/profile',authenticate,async function(req,res,next){
  var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
  let userId=cookies.get('user-id',{signed:true})
  let personId,confirmationToken,email
  if(userId === undefined ){
    ///Add message
    res.redirect('/')
  }else{
    let user=await authModule.auth.getUserMetadata(parseInt(userId))
    personId=user.person
    confirmationToken=user.confirmationToken
    email=user.email
  }
  let personInfo=await authModule.auth.getUserInfo(parseInt(userId))
  //TODO
  // Hardcoded admin
  let admin=false
  if(email=="brunovasquescosta@gmail.com") admin=true
  let message
  if(req.query.msg){
    message=req.query.msg
  }
  res.render('auth/profile',{personInfo,confirmationToken,email,admin,message});
})

router.get('/login',function(req,res,next){
  //TODO can be removed not valid here. Not doing the google login here at this point headers can be removed
  let error={}
  error.message=req.query.msg || undefined
  let retry=req.query.retry || undefined
  if(error.message) {
    res.render('auth/login', {error, retry})
  }else {
    res.render('auth/login', {retry})
  }
})


//Can be subs for login valid user.
router.post('/login',async function(req,res){
  let retry=parseInt(req.body.retry) || parseInt(req.query.retry) || 0
  try {
    let email = req.body.email
    let password = req.body.password
    retry++
    if (email != "") {
      let callback = loginAction
      let login = await authModule.auth.validateLogin(email, password, callback)
      if (login instanceof Error) {
        //Sends the error caught
        res.render(`auth/login`, {error: login, retry})
      } else {
        await setLoginMetadata(req, res, login)  //TODO gPicture
        if (login.action == "json") {
          res[login.action](login.payload)
        } else if(login.action == "redirect") {
          login.payload.retry = retry
          res[login.action](login.path)
        }else{
          login.payload.retry = retry
          res[login.action](login.path, login.payload)
        }
      }
    } else {
      throw new Error('No email provided')
    }
  }catch (error) {
    if (retry > 2) error.message += " Try resetting your password."
    res.render(`auth/login`, {error, retry})
  }

})

//Request a confirmation token to Email
router.post('/login/reset',async (req,res)=>{
  let retry=parseInt(req.body.retry) || 0
  try {
    if (req.body.email) {
      let email=req.body.email

      //TODO add some challenge
      let id=await authModule.auth.getIdFromEmail(req.body.email)
      if(id instanceof Error){
        throw id
      }

      let confirmationToken=await authModule.auth.setNewConfirmationToken(id)
      if(confirmationToken instanceof Error) throw confirmationToken
      //send email with confirmation
      let confirmationCode=confirmationToken.toString().split("").join(" ")
      let domain=getDomain(req)
      let url=`${domain}/auth/login/reset/${encodeURI(email)}/${encodeURIComponent(confirmationToken)}`
      let subject="Email recovery"
      let body=''
      let html=passwordRecoveryTemplate(url,confirmationCode)
      let emailResult=await gmail(email,subject,body,html)

        //TODO remove this fail safe vunerability
      let redirectMsg=`Unable to send recovery email use ${domain}/auth/login/reset/${encodeURI(email)}/${encodeURIComponent(confirmationToken)} to reset password.`
      if( process.env.mode == "PRODUCTION" ){
        redirectMsg="Unable to send recovery email use please contact administrator."
      }
      if(emailResult){
        if(emailResult.id){
          redirectMsg="Recovery procedure sent to email address, please check your spam folder if necessary"
        }
      }
      res.render('auth/confirmation_token',{retry,error:{message:redirectMsg},email})
    }
  }catch (e) {
    res.redirect(`/auth/login?msg=${e}&retry=${retry}`)
  }
})

router.post('/login/reset/manual',async (req,res)=>{
  try{
    let email=req.body.email
    let token=req.body.token
    if(email && token){
      let validUrl=await authModule.auth.validateEmailConfirmationToken(email,token)
      if(validUrl===true){
        let id=await authModule.auth.getIdFromEmail(email)
        if (id instanceof Error) throw id
        let password=await authModule.auth.resetPassword(id)
        if(password instanceof Error) throw password
        res.render('auth/reset_password',{email,password})
      }else{
        throw new Error('Invalid Confirmation token')
      }
    }else{
      throw new Error("Invalid parameters")
    }
  }catch(err){
    res.redirect(`/?msg=${err}`)
  }
})

router.get('/login/reset/:email/:token',async (req,res)=>{
  try{
    let email=req.params.email
    let token=req.params.token
    if(email && token){
      let validUrl=await authModule.auth.validateEmailConfirmationToken(email,token)
      if(validUrl===true){
        let id=await authModule.auth.getIdFromEmail(email)
        if (id instanceof Error) throw id
        let password=await authModule.auth.resetPassword(id)
        if(password instanceof Error) throw password
        res.render('auth/reset_password',{email,password})
      }else{
        throw new Error('Invalid Confirmation token')
      }
    }else{
      throw new Error("Invalid url")
    }
  }catch(error){
    res.redirect(`/?msg=${error}`)
  }
})

// For authenticated users to change password
router.get('/login/reset',authenticate,async (req,res)=>{
  try{
    let user=await extractUserFromCookie(req,res)
    let email=user.email
    res.render('auth/reset_password',{email})
  }catch(err){
    res.redirect(`/?msg=${err}`)
  }
})

router.post('/change_password',async (req,res)=>{
  try{
    let email=req.body.email
    let id=await authModule.auth.getIdFromEmail(email)
    if (id instanceof Error) throw id
    let oldPassword=req.body.oldpassword
    let newPassword=req.body.newpassword
    if(await authModule.auth.changePassword(id,oldPassword,newPassword)===true){
      ct=await authModule.auth.setNewConfirmationToken(id)
      if(ct instanceof Error) throw ct
      let msg="Please try to login with the new password"
      res.redirect(`/?msg=${msg}`)
    }
    throw new Error("Something went wrong, unable to change password")
  }catch (e) {
    res.redirect(`/?msg=${e}`)
  }
})


router.get('/logout',authenticate,async function(req,res){
  //TODO Invalidate session
  try {
    var cookies = new Cookies(req, res, {"keys": keys}), unsigned, signed, tampered;
    let sessionId = cookies.get('session-id', {signed: true})
    let sessionResult = await authModule.session.revokeSession(sessionId)
    cookies.set("user-id", {expires: Date.now()}).set("user-id", "", {signed: true, maxAge: 0}); //sec * min * hour * day * month
    cookies.set("session-id", {expires: Date.now()}).set("session-id", "", {signed: true, maxAge: 0}); //sec * min * hour * day * month
    cookies.set("accessToken", {expires: Date.now()}).set("accessToken", "", {signed: true, maxAge: 0}); //sec * min * hour * day * month
    res.redirect('/')
  }catch (e) {
    res.redirect(`/?msg=${e}`)
  }
})

router.post('/active',authenticate,function(req,res){
  let newState=req.body.newState
  let userId=req.body.userId
  if(newState==="true" && userId){
    authModule.auth.activateUser(userId)
  }else{
    //TODO do this???
    authModule.auth.inactivateUser(userId)
  }
})
router.post('/ban',authenticate,async function(req,res){
  let newState=req.body.newState
  let userId=req.body.userId
  if(newState=="true"){ 
    let result=await authModule.auth.banUser(userId)
    res.json(result)
  }else{
    let result=await authModule.auth.unbanUser(userId)
    res.json(result)
  }
})

router.post("/getId",authenticate,async (req,res)=>{
  var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
  let email=cookies.get('email',{signed:true})
  res.json({email})
})







module.exports = router;
