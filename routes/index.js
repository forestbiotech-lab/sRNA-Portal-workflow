var express = require('express');
var router = express.Router();
var formidable = require('formidable')
var fs = require('fs');
var path = require('path');
var miRPursuit = require('./../views/strings/miRPursuit.json') 
var config = require('./../config/ontologies.json') 
var Promise = require("bluebird");
var https = require('https');
var http = require('http');
var exec = require('child_process').exec;
var miRPursuitVars= require('./../config/miRPursuit.json');
var atob=require('atob');
var btoa=require('btoa');
var nameSearch = require('./../components/miRNADB/nameSearch');
var fullAccess = require('./../components/auth/fullAccess');
var getDomain = require('./../components/auth/getDomain')
//local only
process.env.local ? require('./../.env') : ""; 
//process.env.local ? console.log(process.env): "";




/* GET home page.
* */
router.get('/', fullAccess, function(req, res, next) {
    //TODO make changes to index. Has no profile
    let domain=getDomain(req)
    let message
    if(req.query.msg){
        message=req.query.msg
    }
    res.render('index', { title: 'sRNA Plant Portal',domain,message})
});





router.get('/termsofservice',(req,res)=>{
  res.render('termsofservice',{})
})

router.get('/privacypolicy',(req,res)=>{
  res.render('privacypolicy',{})
})

router.get('/areyouup', function(req, res, next) {
  res.json('yes');
});



module.exports = router;
