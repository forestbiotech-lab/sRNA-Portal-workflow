const Cookies = require("cookies");
var Keygrip = require("keygrip");
var keylist=require('./../../.config_res').cookie.keylist
var keys = new Keygrip(keylist,'sha256','hex')
var token=require('./../../.config_res').cookie.seed
var getDomain = require('./getDomain')
//TODO deprecated don't use this try isAdmin instead
function fullAccess(req,res,next){
    var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
    var query = req.query;
    if(query.access=="none"){
        cookies.set( "access", null ).set( "apikey", null, { signed: true, maxAge: (0) } );
        res.redirect('/')
    }
    if(query.access=="full"){
        cookies.set( "access", token ).set( "apikey", token, { signed: true, maxAge: (1000 * 60 * 60 * 30 * 12) } );
        next()
    }else if ( cookies.get('apikey',{signed:true})===token ){
        next()
    }else{
        res.set({"Cross-Origin-Opener-Policy":"same-origin-allow-popups","Referrer-Policy":"no-referrer-when-downgrade","style-src":"https://accounts.google.com/gsi/style", "script-src":"https://accounts.google.com/gsi/client", "frame-src":"https://accounts.google.com/gsi/", "connect-src":"https://accounts.google.com/gsi/"})
        let domain=getDomain(req)
        let message
        if(req.query.msg){
            message=req.query.msg
        }
        res.render('indexNoSidePanel', { title: 'Under construction!',domain,message})
    }

}


module.exports=fullAccess