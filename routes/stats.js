var express = require('express');
var router = express.Router();
var getOptions = require('./../components/miRNADB/helpers/getOptions.js');
var resolveHelper=require('./../components/miRNADB/helpers/resolveHelper');
var resolveCall = resolveHelper.resolveCall
/// --------- Call Declaration ----------------------------------------
var statsOrganism= require('./../components/miRNADB/statsOrganism');


router.get( "/organism" ,function(req,res,next){
  var errMsg="Stats Router /statsGlobal get - "
  var call=statsOrganism
  resolveCall(call,req,res,errMsg,'reports/stats')
})

module.exports = router;