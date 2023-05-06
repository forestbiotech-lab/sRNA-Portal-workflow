const Cookies = require("cookies");
const Auth =  require('node_auth_module')
const authModule=new Auth(".config_auth.js")
var Keygrip = require("keygrip");
var keylist=require('./../../.config_res').cookie.keylist
var keys = new Keygrip(keylist,'sha256','hex')


async function loginValidUser(error,id,req,res,thirdparty,successMessage,gPicture){
    error=""
    if(error){
        if(thirdparty){
            res.redirect("/?msg="+encodeURI(error.message))
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
                res.redirect('/auth/profile?msg='+encodeURI(successMessage))
            }else{
                res.render('auth/login',{error:{message:"If you are not redirected automatically press the button bellow"},redirect:LOGINREDIRECT})
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

function getCityAndCountry(ipv4){
    return new Promise((res,rej)=>{
        res({
            city:null,
            country:null
        })
    })
}

module.exports = {
    loginValidUser,
    getCityAndCountry
}