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

//This is a function that must be packaged elsewhere afterwards
function getCityAndCountry(ipv4){
  return new Promise((res,rej)=>{
    res({
      city:null,
      country:null
    })
  })
}
function sendEmailNotificationAboutPassswordChange(email){
  let bodytext="Your password has been changed by: ${ip} ${country} using the following platform ${platform}" 
}
///
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

async function extractUserFromCookie(req,res){
  var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
  let userId=cookies.get('user-id',{signed:true})
  if(userId === undefined ){
    throw Error("Undefined user id in cookie!")
  }else{
    let user=await authModule.auth.getUserMetadata(parseInt(userId))
    return user
  }
}
router.get('/loggedin',authenticate, async function(req,res){
  var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
  let sessionId=cookies.get('session-id')
  let accessToken=cookies.get('accessToken',{signed:true})
  let gPicture=cookies.get('gPicture',{signed:true})
  try{    
    let validate=await authModule.session.validateSession(sessionId,accessToken)
    if (validate==true){
     res.json({logged:true,gPicture})
    }else{
      throw Error("invalid")
    }
  }catch(err){
    res.json({logged:false})
  }  
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
router.get('/profile',authenticate,async function(req,res,next){
  var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
  let userId=cookies.get('user-id',{signed:true})
  let personId=null
  let confirmationToken=null
  let email=null
  if(userId === undefined ){
    res.redirect('/')
  }else{
    let user=await authModule.auth.getUserMetadata(parseInt(userId))
    personId=user.person
    confirmationToken=user.confirmationToken
    email=user.email
  }
  let personInfo=await authModule.auth.getUserInfo(parseInt(userId))
  res.render('auth/profile',{personInfo,confirmationToken,email});
})

router.get('/login',function(req,res,next){
  res.render('auth/login',{})
})

router.post('/login',function(req,res){
  let email=req.body.email
  let password=req.body.password
  authModule.auth.validateLogin(email,password,callback)  //TODO change to loginValidUser and remove callback
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
router.get('/login/reset',authenticate,async (req,res)=>{
  //Procedure for reset deactivate user if inactive and confirmationToken is ok
  try{
    let user=await extractUserFromCookie(req,res)
    let email=user.email
    res.render('auth/reset_password',{email})
  }catch(err){
    res.redirect('/')
  }
})
router.get('/login/reset/:email/:token',async (req,res)=>{
  //Procedure for reset deactivate user
  //User must be authenticated
  let email=req.params.email
  let token=req.params.token
  try{
    let validUrl=await authModule.auth.validateEmailConfirmationToken(email,token)
    if(validUrl===true){
      res.render('resetpassword',{email})
    }else{
      res.redirect("/")
    }
  }catch(error){
    res.redirect("/")
  }
})
router.post('/login/reset',async (req,res)=>{
  //How do I verify origin of request
  //Needs confirmation token or validate to allow reset
  if(req.body.confirmationToken && req.body.email){
    let validUrl=await authModule.session.validateConfirmationToken(email,token)
    if(validUrl===true){
      resetpassword(req,res)
    }
  }else{
    authenticate(req,res,resetpassword)
  }
  function resetpassword(req,res){
      
  }
  // 
})

router.get('/logout',function(req,res){
  var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
  cookies.set( "user-id",{expires: Date.now()}).set( "user-id", "",{ signed: true, maxAge: 0 } ); //sec * min * hour * day * month  
  cookies.set( "session-id",{expires: Date.now()}).set( "session-id", "",{ signed: true, maxAge: 0 } ); //sec * min * hour * day * month  
  cookies.set( "accessToken",{expires: Date.now()}).set( "accessToken", "",{ signed: true, maxAge: 0 } ); //sec * min * hour * day * month  
  res.redirect('/')
})
router.post('/active',function(req,res){
  let newState=req.body.newState
  let userId=req.body.userId
  if(newState=="true"){ 
    authModule.auth.activateUser(userId)
  }else{
    authModule.auth.inactivateUser(userId)
  }
})
router.post('/ban',async function(req,res){
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

router.post('/login/verify/google-token',function(req,res){
  
  const client = new OAuth2Client(CLIENT_ID);
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: req.body.id_token,
      audience: CLIENT_ID
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];

    var firstName=payload.given_name
    var lastName=payload.family_name
    var email=payload.email
    var gPicture=payload.picture

    loginEmail(firstName,lastName,email)
    async function loginEmail(firstName,lastName,email){
      try{
        let error=null
        let userId=await authModule.auth.getIdFromEmail(email)
        if(userId instanceof Error){
          //TODO 
          //create new user 
          //creatingNewUSer
          let userId= await authModule.auth.register(firstName,lastName,email,password=null,thirdparty=true)
          loginValidUser(error,userId,req,res,thirdparty=true,successMessage="New user create from thirdparty account! Reloading page!",gPicture)
          //The user has been created
        }else{
          loginValidUser(error,userId,req,res,thirdparty=true,successMessage="Logged in! Reloading page!",gPicture)
          //No res and req ???
        }
      }catch(error){
        let msg = error.message
          res.json(msg)
      }      
    }
    //const active= await tpAuth.lookUpPersonByEmailAuthentication(payload,options,callBack)
    

    // If request specified a G Suite domain:
    // const domain = payload['hd'];
  }
  verify().catch(console.error);
})

async function loginValidUser(error,id,req,res,thirdparty,successMessage,gPicture){
  if(error){
    if(thirdparty){
      let message=error.message
      res.json(message)
    }else{
      res.render('auth/login',{error}) 
    }
  }else{
    try{
      let ipv4="127.0.0.1"
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
      cookies.set( "accessToken",accessToken).set( "accessToken", accessToken, { signed: true, maxAge: (1000 * 60 * 24 ) } ); //sec * min * hour * day * month  
      cookies.set( "gPicture",gPicture).set( "gPicture", gPicture, { signed: true, maxAge: (1000 * 60 * 60 * 24 * 30 ) } ); //sec * min * hour * day * month  
      if(thirdparty){
        res.json(successMessage)
      }else{
        //This isn't a good because unless if it comes from here you redirect to the correct url not sure on the correct landing page after this login.
        res.render('differential_expression',{personInfo,numOfStudies:0})
      }
    }catch(error){
      if(thirdparty){
        let message=error.message
        res.json(message)
      }else{
        res.render('auth/login',{error}) 
      }
    }
  }
}



module.exports = router;





///////////////////////////////////IGNORE FROM HERE ON//////////////////



// Download your OAuth2 configuration from the Google
//const keys = require('./oauth2.keys.json');

/**
 * Start by acquiring a pre-authenticated oAuth2 client.
 */
async function main() {
  const oAuth2Client = await getAuthenticatedClient();
  // Make a simple request to the People API using our pre-authenticated client. The `request()` method
  // takes an GaxiosOptions object.  Visit https://github.com/JustinBeckwith/gaxios.
  const url = 'https://people.googleapis.com/v1/people/me?personFields=names';
  const res = await oAuth2Client.request({url});
  console.log(res.data);

  // After acquiring an access_token, you may want to check on the audience, expiration,
  // or original scopes requested.  You can do that with the `getTokenInfo` method.
  const tokenInfo = await oAuth2Client.getTokenInfo(
    oAuth2Client.credentials.access_token
  );
  console.log(tokenInfo);
}

/**
 * Create a new OAuth2Client, and go through the OAuth2 content
 * workflow.  Return the full client to the callback.
 *//*
function getAuthenticatedClient() {
  return new Promise((resolve, reject) => {
    // create an oAuth client to authorize the API call.  Secrets are kept in a `keys.json` file,
    // which should be downloaded from the Google Developers Console.
    const oAuth2Client = new OAuth2Client(
      keys.web.client_id,
      keys.web.client_secret,
      keys.web.redirect_uris[0]
    );

    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/userinfo.profile',
    });


////////////////////

          if (req.url.indexOf('/oauth2callback') > -1) {
            // acquire the code from the querystring, and close the web server.
            const qs = new url.URL(req.url, 'http://localhost:3000')
              .searchParams;
            const code = qs.get('code');
            console.log(`Code is ${code}`);
            res.end('Authentication successful! Please return to the console.');
            server.destroy();

            // Now that we have the code, use that to acquire tokens.
            const r = await oAuth2Client.getToken(code);
            // Make sure to set the credentials on the OAuth2 client.
            oAuth2Client.setCredentials(r.tokens);
            console.info('Tokens acquired.');
            resolve(oAuth2Client);
          }

////////////////      
  });
}

main().catch(console.error);*/