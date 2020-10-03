var express = require('express');
var router = express.Router();
var fs = require('fs')
var path=require('path')
var octicons = require("@primer/octicons")
var saveSequence = require('./../components/miRNADB/saveSequence')
var convertFileToMatrix=require('./../components/preProcessing/convertFileToMatrix')
var rawReadsSaveController=require('./../components/miRNADB/controllers/rawReadsSaveController')
var getDynamicTable=require('./../components/miRNADB/getDynamicTable')
var assay=require('./../components/miRNADB/queryModels/assay')
var countAssayDataForStudy=require('./../components/miRNADB/countAssayDataForStudy')
var getAssayDataWithAnnotations=require('./../components/miRNADB/getAssayDataWithAnnotations')
var getTargets=require('./../components/miRNADB/getTargets')
var assembleAssayData=require('./../components/miRNADB/assembleAssayData')
var targetsProfile=require('./../components/miRNADB/targets/profiles')
var targetsFileActions=require('./../components/miRNADB/targets/targetsFileActions')
var formFromTable=require('./../components/forms/formFromTable')

var wsClient=require('.././components/websockets/wsClient').Client
var countAssociatedTables=require('./../components/forms/countAssociatedTables')
var Cookies = require('cookies');
var Keygrip = require("keygrip");
const keylist = require('./../.config_res').cookie.keylist
var keys = new Keygrip(keylist,'sha256','hex')

const Auth =  require('node_auth_module')
const authModule=new Auth(".config_auth.js")
//This should not have logic.
//Paths
//Errors
//Templates
//Types Promise or not
//Multiple Promises or single



///
async function authenticate(req,res,next){
  var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
  let sessionId=cookies.get('session-id')
  let userId=cookies.get('user-id',{signed:true})
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

//function to load cookie related data.
function getAuthenticatedData(res){
  //return object with personId,userId etc.
}

router.get('/sequence/overview/:sequenceId',function(req,res){
  let sequenceId=req.params.sequenceId
  res.render('metadata/sequence_overview',{sequenceId})
})


module.exports = router;