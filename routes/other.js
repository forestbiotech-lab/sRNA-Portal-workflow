var express = require('express');
var router = express.Router();


var Cookies = require('cookies');
var Keygrip = require("keygrip");
var keylist=["SEKRIT2", "SEKRIT1"];
var keys = new Keygrip(keylist,'sha256','hex')
var token="qawsaffsfkjahf3728fh93qo38gfwqig3qq82gdq93yd9wqd39qdxeaiwhah";




//local only
process.env.local ? require('./../.env') : ""; 
//process.env.local ? console.log(process.env): "";

function fullAccess(req,res){
  var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
  if (req.cookies.apikey!=token){ 
    res.render('indexNoSidePanel', { title: 'Under construction!'})
    return false
  }else{
    return true
  }

}

router.get('/*', function(req,res){
  if (!fullAccess(req,res)) return null;
  res.render('index',{title: "Other"})
})

module.exports = router;
