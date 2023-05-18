var express = require('express');
var router = express.Router();
var resolveHelper=require('./../components/miRNADB/helpers/resolveHelper');
var resolveCall = resolveHelper.resolveCall
/// --------- Call Declaration ----------------------------------------
var sequenceSearch = require('./../components/miRNADB/sequenceSearch2');
var nameSearch = require('./../components/miRNADB/nameSearch2');
var getFeatures = require('./../components/miRNADB/getFeatures');
var linkedMatureMiRNA = require('./../components/miRNADB/linkedMatureMiRNA');
var {getAssayDataForStudy}=require('./../components/miRNADB/getAssayData')
var exportFile=require('./../components/miRNADB/exportFile')
const getSequenceAssemblies = require("../components/miRNADB/getSequence_assemblies");
const {publicTable} = require("../components/auth/tableAccess");
const getTable=require('../components/miRNADB/getTable')
const getFK=require('../components/miRNADB/getFK')
const getRow=require('../components/miRNADB/getRow')
const getRowsWhere=require('../components/miRNADB/getRows')
const tailorMultiTableLookup = require("../components/forms/tailorMultiTableLookup");
/// --------------End -------------------------------------------------


router.get('/', function(req, res){
  res.render('db', { title: 'Express',tableValues:[] });
})


//Old version To be deprecated
//################################# Should be seperated #############################
var sequenceSearch = require('./../components/miRNADB/sequenceSearch2');
const fullAccess = require("../components/auth/fullAccess");
router.get('/sequence/:sequence',fullAccess, function(req, res){
  req.query.searchText=req.params.sequence;
  sequenceSearch(req.query)
      .then(function(sequenceSearchRes){
        console.log(sequenceSearchRes)
        res.render('db',{tableValues: sequenceSearchRes});
      }).catch(function(err){
    var statusCode;
    try{
      statusCode=err.metadata.status[0].code;
    }
    catch(error){
      statusCode=500;
    }
    res.status(statusCode).json(err.err);
  })

})


//OLD version, to be deprecated
router.get('/name/:name',fullAccess, function(req, res){
  req.query.searchText=req.params.name;
  nameSearch(req.query)
      .then(function(nameSearchRes){
        console.log(nameSearchRes)
        res.render('db',{tableValues: nameSearchRes});
      }).catch(function(err){
    var statusCode;
    try{
      statusCode=err.metadata.status[0].code;
    }
    catch(error){
      statusCode=500;
    }
    res.status(statusCode).json(err.err);
  })

})



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

router.get('/sequence_assemblies',(req,res)=>{
  getSequenceAssemblies().then(data=> {
    res.json(data)
  }).catch(e=> {
    res.render('error', e)
  })
})

router.post('/publictable/:table',publicTable,(req,res)=>{
  let tableName=req.params.table
  getTable(tableName).then(data=>res.json(data))
      .catch(e=>res.json(e))
})
router.post('/publictableFKs/:table',publicTable,(req,res)=>{
  let tableName=req.params.table
  getFK(tableName).then(data=> {
    res.json({data,fks:data.fks})
  }).catch(e=>res.json(e))
})
router.post('/publictableRow/:table/:pkColumn/:pk',publicTable,(req,res)=>{
  let tableName=req.params.table
  let pkColumn=req.params.pkColumn
  let pk=req.params.pk
  getRow(tableName,pkColumn,pk).then(data=> {
    res.json(data)
  }).catch(e=>res.json(e))
})

router.post('/publictableRows/:table/where',publicTable,(req,res)=>{
  let tableName=req.params.table
  let where=req.body
  getRowsWhere(tableName,where).then(data=> {
    res.json(data)
  }).catch(e=>res.json(e))
})

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

router.get('/1',(req,res)=>{
  res.render('datagrid')
})

router.get('/assaydata/:studyId', async function(req, res, next) {
  try {
    let data=await getAssayDataForStudy(req.params.studyId)
    if (data instanceof Error) throw data
    res.json(data)
  }catch (e) {
    res.status(400).json({err:{msg:e.message,stack:e.stack}})
  }
});

router.post('/assaydata/:studyId', async function(req, res, next) {
  try {
    let where={}
    if(req.body.value)
      where[req.body.key]=req.body.value
    let page=req.body.page
    let data=await getAssayDataForStudy(req.params.studyId,where,page)
    if (data instanceof Error) throw data
    res.json(data)
  }catch (e) {
    res.status(400).json({err:{msg:e.message,stack:e.stack}})
  }
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

router.post('/tailored-query',(req,res)=>{
   try{
    let sourceTable=req.body.sourceTable
    let tableConnections=req.body.tableConnections
    let callOutputStructure=req.body.callOutputStructure
    tailorMultiTableLookup(sourceTable,tableConnections,callOutputStructure).then(data=>{
      res.json(data)
    }).catch(err=>{
      let message=err.message
      res.writeHead( 500, message, {'content-type' : 'text/plain'});
      res.end(message);
    })
  }catch(err){
    let message=err.message
    res.writeHead( 500, message, {'content-type' : 'text/plain'});
    res.end(message);
  }
})


router.get('/*',function(req,res){
  let errMsg="API Router - Call is not defined"
  let status=400
  res.status(status).json(errMsg)
})

module.exports = router;
