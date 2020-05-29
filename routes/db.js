var express = require('express');
var router = express.Router();
var resolveHelper=require('./../components/miRNADB/helpers/resolveHelper');
var resolveCall = resolveHelper.resolveCall
/// --------- Call Declaration ----------------------------------------
var sequenceSearch = require('./../components/miRNADB/sequenceSearch2');
var nameSearch = require('./../components/miRNADB/nameSearch2');
var getFeatures = require('./../components/miRNADB/getFeatures');
var linkedMatureMiRNA = require('./../components/miRNADB/linkedMatureMiRNA');
var getAssayDataWithAnnotations=require('./../components/miRNADB/getAssayDataWithAnnotations')
var exportFile=require('./../components/miRNADB/exportFile')
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

/* GET feature */
router.get('/feature', function(req, res, next) {
  var errMsg="API Router /feature get - "
  var call=getFeatures
  resolveCall(call,req,res,errMsg)
});

/* GET linked mature miRNA for graph */
router.get('/linkedMatureMiRNA', function(req, res, next) {
  var errMsg="API Router /feature get - "
  var call=linkedMatureMiRNA
  resolveCall(call,req,res,errMsg)
});

router.get('/assaydata/:study', function(req, res, next) {
  var errMsg="api Router /assayDat get - "
  var call=getAssayDataWithAnnotations
  resolveCall(call,req,res,errMsg)
});
router.get('/assaydata/:study/raw_reads.tsv',function(req,res,next){
  exportFile.rawReadsFile(req).then(data=>{
    res.set('Content-Type','text/tsv')
    res.send(data)
  },rej=>{
    res.status(400).json(rej)
  })
})
router.get('/assays/:study/matrix/outputs.tsv',function(req,res){
  exportFile.assayOutputsFile(req).then(data=>{
    res.set('Content-Type','text/tsv')
    res.send(data)
  },rej=>{
    res.status(400).json(rej)
  })
})
router.get('/assays/:study/design/study_design.tsv',function(req,res){
  exportFile.studyDesignFile(req).then(data=>{
    res.set('Content-Type','text/tsv')
    res.send(data)
  },rej=>{
    res.status(400).json(rej)
  })
})

router.get('/*',function(req,res){
  let errMsg="API Router - Call is not defined"
  let status=400
  res.status(status).json(errMsg)
})

module.exports = router;
