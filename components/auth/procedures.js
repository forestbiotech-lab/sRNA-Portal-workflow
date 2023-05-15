const Cookies = require("cookies");
const Auth =  require('node_auth_module')
const authModule=new Auth(".config_auth.js")
var Keygrip = require("keygrip");
const http = require("http");
const fs = require("fs");
var keylist=require('./../../.config_res').cookie.keylist
var keys = new Keygrip(keylist,'sha256','hex')

//Valid should be changed to a hash or the payload should be encrypted with jwt to ensure validation

async function loginAction(error,id,thirdparty,successMessage){
    if(error){
        if(thirdparty){
            return {
                action:"redirect",
                thirdpary,
                path:`/?msg=${error.message}`,
                payload:"",
                error
            }
        }else{
            return {
                action:"render",
                path:"auth/login",
                error,
                payload:{error}
            }
        }
    }else{
        try{
            return {
                id,
                thirdparty,
                action:"redirect",
                path:"/auth/profile?msg="+encodeURI(successMessage),
                payload:""
            }
        }catch(error){
            if(thirdparty){
                let message=error.message
                return {
                    action:"json",
                    payload:message
                }
            }else{
                return {
                    action:"render",
                    path:"auth/login",
                    payload:{error}
                }
            }
        }
    }
}

async function extractMetadataFromLogin(req){
    let ipv4=req.headers['x-real-ip']
    let ipv6 = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if(ipv6=="::1"){
        if(ipv4==undefined)
            ipv4="127.0.0.1"
    }
    if (ipv6.substr(0, 7) == "::ffff:") {
        if(ipv4==undefined)
            ipv4 = ipv6.substr(7)
    }
    let valid=1
    let location=await getCityAndCountry(ipv4)
    let platform=req.headers['user-agent']
    return {ipv4,ipv6,valid,location,platform}
}

async function setLoginMetadata(req,res,login){
    try {
        let {ipv4, ipv6, valid, location, platform} = await extractMetadataFromLogin(req)
        let session = await authModule.session.saveSession(login.id, ipv4, ipv6, platform, valid, location.city, location.country)
        let accessToken = session.accessToken
        let sessionId = session.id
        var cookies = new Cookies(req, res, {"keys": keys}), unsigned, signed, tampered;
        cookies.set("user-id", login.id).set("user-id", login.id, {signed: true, maxAge: (1000 * 60 * 60 * 24 * 30)}); //sec * min * hour * day * month
        cookies.set("session-id", sessionId).set("session-id", sessionId, {
            signed: true,
            maxAge: (1000 * 60 * 60 * 24 * 30)
        }); //sec * min * hour * day * month
        cookies.set("accessToken", accessToken).set("accessToken", accessToken, {
            signed: true,
            maxAge: (1000 * 60 * 24)
        }); //sec * min * hour * day * month
        cookies.set("gPicture", login.gPicture).set("gPicture", login.gPicture, {signed: true, maxAge: (1000 * 60 * 60 * 24 * 30)}); //sec * min * hour * day * month
    }catch(e){
        console.log(e)
    }
}

function sendEmailNotificationAboutPassswordChange(email){
    let bodytext="Your password has been changed by: ${ip} ${country} using the following platform ${platform}"
}


function getCityAndCountry(ipv4){
    if(ipv4=="127.0.0.1" || ipv4=="localhost" || ipv4==undefined)
        return new Promise((res,rej)=>res({country:null,city:"null"}))
    return new Promise((resolve,rej)=>{
        const http = require('http')
        const options = {
            hostname: 'ip-api.com',
            port: 80,
            path: `/json/${ipv4}`,
            method: 'GET'
        }
        const request = http.request(options, res => {
            res.on('data', d => {
                let locationInfo = JSON.parse(d.toString('utf8'))
                //saveInfo = JSON.stringify({[ip]: info}) + "\n"
                //fs.appendFileSync("ipList.json", saveInfo, 'utf8')
                resolve(locationInfo)
            })
        })
        request.on('error', error => {
            console.error(error)
        })
        request.end()
    })
}

async function extractUserFromCookie(req,res){
    let cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
    let userId=cookies.get('user-id',{signed:true})
    if(userId === undefined ){
        return new Error("Undefined user id in cookie!")
    }else{
        let user=await authModule.auth.getUserMetadata(parseInt(userId))
        return user
    }
}

module.exports = {
    loginAction,
    getCityAndCountry,
    extractUserFromCookie,
    setLoginMetadata
}