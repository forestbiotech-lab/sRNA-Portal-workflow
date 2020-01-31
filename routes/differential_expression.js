var express = require('express');
var router = express.Router();
var fs = require('fs')
var path=require('path')
var octicons = require("@primer/octicons")
var saveSequence = require('./../components/miRNADB/saveSequence')
var convertFileToMatrix=require('./../components/preProcessing/convertFileToMatrix')
var matrixUploadController=require('./../components/miRNADB/controllers/matrixUploadController')
var getDynamicTable=require('./../components/miRNADB/getDynamicTable')
var countAssayDataForStudy=require('./../components/miRNADB/countAssayDataForStudy')
var getAssayDataWithAnnotations=require('./../components/miRNADB/getAssayDataWithAnnotations')
var assembleAssayData=require('./../components/miRNADB/assembleAssayData')
var targetsProfile=require('./../components/miRNADB/targets/profiles')
var targetsFileActions=require('./../components/miRNADB/targets/targetsFileActions')
var formFromTable=require('./../components/forms/formFromTable').tableStructure
var upload_data=require('./../components/forms/upload_data')
const uploadDir=path.join(__dirname, '../uploads');



//////// upload

/////////



router.get('/',function(req,res){
	res.render('differential_expression');
})

router.get('/raw-read-matrix',function(req,res){
	res.render('de/rawreadmatrix')
})
//POST UPLOAD                                     POST UPLOAD    //RESTRICT access required
router.post('/upload', function(req, res){
  upload_data.uploadFile(req,uploadDir).then(result=>{
    result instanceof err ? res.status('400').json(result) : res.json(result)
  }).catch(err=>{
    res.status('500').json('err')
  })
});

router.post('/uploaded-file',function(req,res){ 	 
  let uploadedFilename=req.body.filename
  let studyId=req.body.studyId
  if( req.body.responseType=="json"){
    var filePath=path.join(uploadDir, uploadedFilename)
    convertFileToMatrix(filePath).then(function(data){
      data instanceof Error ? res.status(404).json(err) : res.json(data)
    }).catch(function(err){
      res.status(404).json(err)
    }) 
  }else{
    res.render('de/uploadedFile',{uploadedFilename,studyId});
  }
})

router.put('/uploadMatrix',function(req,res){
  let dataset=Object.assign({},req.body)
  matrixUploadController(dataset).then(function(data){
		res.json(data)
	}).catch(function(err){
		res.status(500).json(err)
	})
})

router.get('/assays/:study',function(req,res){
  let tablename="Assay"
  let studyId=req.params.study
  let where={'study':studyId}
  getDynamicTable(tablename,where).then(function(data){
    data instanceof Error ? res.render('error',data) : res.render('de/assays',{data,studyId})
  }).catch(function(error){
    res.render('error',error)
  })
})

router.get('/assaydata/:study', function(req, res, next) {
  var studyId=req.params.study
  res.render('de/assayData',{studyId})
});

router.get('/assaydata/:study/matrix', function(req,res, next){      
  assembleAssayData(req).then(data=>{
    data instanceof Error ? res.status(500).json(data) : res.json(data)
  }).catch(err=>{
    res.json('err')
  })
})


router.post('/count/assaydata/',function(req,res){
  let studyId=req.body.studyId
  countAssayDataForStudy(studyId).then(data=>{
    data instanceof Error ? res.status(500).json(data) : res.json(data)
  }).catch( err =>{
    res.status(500).json(err)
  })

})

router.get('/targets/new',function(req,res){
  res.render('de/targets')
})

router.post('/targets/upload/:studyid', function(req, res){
     //////////////////////////
     upload_data.uploadTargets(req,uploadDir).then(result=>{
      result instanceof Error ? res.status(400).json(result) : res.json(result)
     }).catch(err=>{
      res.status('500').json('err')
     })
});

router.post('/targets/columnAssociation',(req,res)=>{
  //dynamic
  let reqData=req.body
  let lineNumber=reqData.lineNumber
  let hash=reqData.hash
  let filename=reqData.filename
  let studyId=reqData.studyId
  let template=reqData.template || JSON.stringify('')
  template=JSON.parse(template).split('\t') 
  let header=JSON.parse(reqData.header).split('\t') 
  let fileHeaders= lineNumber == 0 ? template : header

  //hard-coded
  let tables=["Feature","Target","Transcript"]
  let tableData={}
  let type='target'
  let icon={date:"calendar",number:"list-ordered",text:"text-size",checkbox:"file-binary"}
  
  tables.forEach(table=>{
    tableStructure=formFromTable(table)
    if (tableStructure instanceof Error) res.render('error',"Unable to get tableStructure") 
    tableData[table]=tableStructure
  })
  targetsProfile.listProfiles(type).then(profiles=>{
    var accessions="Accession_Search"
    tables.unshift(accessions)
    tableData[accessions]=[{name:"miRNA",type:"text"},{name:"transcript",type:"text"}]
    res.render('de/targetColumnAssociation',{tables,tableData,octicons,icon,fileHeaders,profiles})
  }).catch(err=>{
    res.render('error',{message:"Unable to get profiles",error:{status:"The query had issues"},stack:err.stack})
  })
})

router.get('/targets/profile/get/:type/:profile',(req,res)=>{
  let type=req.params.type
  let profile=req.params.profile
  targetsProfile.getProfile(type,profile).then(result=>{
    res.json(result)
  }).catch(function(err){
    res.status('400').json({err})
  })
})

router.post('/targets/profile/set/:type/:profile',(req,res)=>{
  let type=req.params.type
  let profile=req.params.profile
  let body=req.body
  targetsProfile.setProfile(type,profile,body).then(result=>{
    res.status(200).json("ok")
  }).catch(function(err){
    res.status(400).json(err)
  })
})

router.post('/targets/load/db/',(req,res)=>{
  let body=req.body

  // - must be passed by body -
  let genome_id=3
  let studyId=1
  let filename="psRNATargetJob.tsv"
  let assay_ids=[1,2]

  // --------------------------

  let file=path.join(uploadDir,`${studyId}/targets/${filename}`)
  targetInserts=targetsFileActions.loadTargets(file,genome_id,assay_ids).then(getPromises=>{
    Promise.all(getPromises).then(result=>{
      result instanceof Error ? res.status(500).json(result) : res.json(result)
    }).catch(err=>{
    	res.status(500).json(err)
    })
  })
})

module.exports = router;