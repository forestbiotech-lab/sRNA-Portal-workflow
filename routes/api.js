var express = require('express');
var router = express.Router();
var getOptions = require('./../components/miRNADB/helpers/getOptions.js');
var resolveHelper=require('./../components/miRNADB/helpers/resolveHelper');
var resolveCall = resolveHelper.resolveCall
/// --------- Call Declaration ----------------------------------------
var sequenceSearch = require('./../components/miRNADB/sequenceSearch2');
var nameSearch = require('./../components/miRNADB/nameSearch2');

/// --------------End -------------------------------------------------



/* GET sequences search */
router.get('/sequence', function(req, res, next) {
  var errMsg="API Router /sequence get - "
  var call=sequenceSearch
  resolveCall(call,req,res,errMsg)  
});

/* GET names search */
router.get('/name', function(req, res, next) {
  var errMsg="API Router /name get - "
  var call=nameSearch
  resolveCall(call,req,res,errMsg)
});


module.exports = router;
