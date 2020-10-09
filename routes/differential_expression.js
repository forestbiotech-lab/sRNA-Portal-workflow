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
var upload_data=require('./../components/forms/upload_data')
var wsClient=require('.././components/websockets/wsClient').Client
var countAssociatedTables=require('./../components/forms/countAssociatedTables')
var augmentTable=require('./../components/miRNADB/transactions/augmentTable')
var exportFile=require('./../components/miRNADB/exportFile')
const uploadDir=path.join(__dirname, '../uploads');
const destinationFolderRawReads = "raw_reads"
const destinationFolderTargets = "targets"
var Cookies = require('cookies');
var Keygrip = require("keygrip");
const keylist = require('./../.config_res').cookie.keylist
var keys = new Keygrip(keylist,'sha256','hex')
var calculateCPM=require('./../components/miRNADB/transactions/calculateCPM')
const Auth =  require('node_auth_module')
const authModule=new Auth(".config_auth.js")
//This should not have logic.
//Paths
//Errors
//Templates
//Types Promise or not
//Multiple Promises or single


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

router.get('/a/:study',function(req,res){
  require('.././components/docker/bioconductor/')("opt").then(stream=>{
    var svg = '';
    stream.on('data',function(data){
      svg += data.toString('utf8');
    });
    stream.on('end',function(){
      //console.log('final output ' + string);
      res.render('svg',{svg})
    });

  })
})

router.get('/',authenticate,async function(req,res){
  var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
  let userId=cookies.get('user-id',{signed:true})
  let personId=null
  if(userId === undefined ){
    res.redirect('/')
  }else{
    let user=await authModule.auth.getUserMetadata(parseInt(userId))
    personId=user.person
  }
  let tablename="Person";
  let associatedTable="Person"
  let attributes={tablename,where:{id:personId}}
  let personInfo=formFromTable.tableEntry(attributes)
  let studyCount=countAssociatedTables(tablename="Study",associatedTable,{responsible:personId})
  Promise.all([personInfo,studyCount]).then(function(data){
    let personInfo=data[0]
    let numOfStudies=data[1]
    res.render('differential_expression',{personInfo,numOfStudies});
  },rej=>{
    res.status(404).render('err',{error:rej})
  }).catch(function(error){
    res.status(404).json('error',{error})
  })
})


//This is where the rawReads tsv are sent to save on server
router.post('/upload/:studyId', function(req, res){
  upload_data.uploadFile(req,uploadDir,destinationFolderRawReads).then(result=>{
    result instanceof Error ? res.status('400').json(result) : res.json(result)
  }).catch(err=>{
    res.status('500').json('err')
  })
});

//Template de/UploadedFile - Quality control of upload. 
router.post('/uploaded-file',function(req,res){ 	 
  let uploadedFilename=req.body.filename
  let studyId=req.body.studyId.trim()
  let studyTitle=req.body.studyTitle
  if( req.body.responseType=="json"){
    var filePath=path.join(uploadDir, `/${studyId}/${destinationFolderRawReads}/${uploadedFilename}`)
    convertFileToMatrix(filePath).then(function(data){
      data instanceof Error ? res.status(404).json(data) : res.json(data)
    }).catch(function(err){
      err.msg=err.message
      res.status(404).json(err)
    }) 
  }else{
    res.render('de/uploadedFile',{uploadedFilename,studyId,studyTitle});
  }
})

router.post('/uploadMatrix',function(req,res){
  rawReadsFilePath=path.join(uploadDir, `/${req.body.studyId}/${destinationFolderRawReads}/${req.body.rawReadsfilename}`)
  let dataset=Object.assign({rawReadsFilePath},req.body)
  let ws=new wsClient()
  ws.connect("rawreads",res)
  rawReadsSaveController.saveRawReads(dataset,ws).then(data=>{
    ws.close()
  },rej=>{
    ws.close()
  }).catch(function(err){
    ws.close()
  })
})


router.get('/assays/:study',function(req,res){
  let study_id=req.params.study
  assay.index(study_id).then(function(data){
    data instanceof Error ? res.render('error',data) : res.render('de/assays',{data:data.data,study_id})
  }).catch(function(error){
    res.render('error',error)
  })
})
router.get('/assays/:study/matrix',function(req,res){
  let study_id=req.params.study
  assay.index(study_id).then(function(data){
    data instanceof Error ? res.json(data) : res.json(data)
  }).catch(function(error){
    res.json(error)
  })
})
router.post('/assays/:study/CPM',async function(req,res){
  let study_id=req.params.study
  let assay_ids=req.body.assayIds
  let ws=new wsClient()
  ws.connect("CPM",res)
  await ws.isConnected()
  calculateCPM.main(assay_ids,ws).then(function(data){
    data instanceof Error ? console.log(data) : console.log(data)
  }).catch(function(error){
    console.log(error)
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

router.get('/targets/add/:study',function(req,res){
  res.render('de/targets',{study_id:req.params.study})
})

router.post('/targets/upload/:studyid', function(req, res){
     //////////////////////////
     upload_data.uploadFileGetPreview(req,uploadDir,destinationFolderTargets).then(result=>{
      result instanceof Error ? res.status(400).json(result) : res.json(result)
     }).catch(err=>{
      res.status('500').json('err')
     })
});
router.post('/targets/augment-info/upload/:studyid', function(req, res){
   upload_data.uploadFileGetPreview(req,uploadDir,destinationFolderTargets).then(result=>{
    result instanceof Error ? res.status(400).json(result) : res.json(result)
   }).catch(err=>{
    res.status('500').json('err')
   })
});

router.post('/targets/augment-info/update',async function(req,res){
  let fileName=req.body.fileName
  let studyId=req.body.studyId
  let filePath=path.join(uploadDir,studyId,destinationFolderTargets,fileName)  
  let ws=new wsClient()
  let key={
    table:"Transcript",
    attribute:"accession",
    column:0
  }
  let updateValues=[{
    table:"Target",
    attribute:"description",
    column:"2"}]
  let insertAttributes={
    key,
    updateValues,
    studyId,
  }

  ws.connect("augment_table",res)
  await ws.isConnected()

  augmentTable(filePath,insertAttributes,ws).then(result=>{
    ws.sendMsg('Success: Finished transactions!')
  }).catch(err=>{
    let msg=err.message
    ws.sendMsg(`Error: ${err}`)
    ws.close()
  })
    
})

router.post('/targets/columnAssociation', (req,res)=>{
  
  //dynamic
  let reqData=req.body
  let lineNumber=reqData.lineNumber
  let hash=reqData.hash
  let target_filename=reqData.filename
  let studyId=reqData.studyId
  let template=reqData.template || JSON.stringify('')
  template=JSON.parse(template).split('\t') 
  let header=JSON.parse(reqData.header).split('\t') 
  let fileHeaders= lineNumber == 0 ? template : header

  //hard-coded
  let tables=["Feature","Target","Transcript"]
  let tableData={}
  let type='target'
  let icon={date:"calendar",number:"list-ordered",text:"text-size",checkbox:"file-binary",select:"file-binary"}
  
  tables.forEach(table=>{
    tableStructure=formFromTable.tableStructure(table)
    if (tableStructure instanceof Error) res.render('error',"Unable to get tableStructure") 
    tableData[table]=tableStructure
  })


  

  targetsProfile.listProfiles(type).then(profiles=>{
    var accessions="Accession_Search"
    tables.unshift(accessions)
    tableData[accessions]=[{name:"miRNA",type:"text"},{name:"transcript",type:"text"}]
    res.render('de/targetColumnAssociation',{tables,tableData,octicons,icon,fileHeaders,profiles,target_filename,study_id:studyId})
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

router.post('/targets/load/db/',async(req,res)=>{
  let target_filename=req.body.target_filename
  let transcript_xref=req.body.transcript_xref
  let study_id=req.body.studyId

  // - must be passed by body -
  let genome_id=3
  
  // --------------------------

  let ws=new wsClient()
  ws.connect("TARGET",res)
  await ws.isConnected()
     
  let file=path.join(uploadDir,`${study_id}/${destinationFolderTargets}/${target_filename}`)
  targetInserts=targetsFileActions.loadTargets(file,genome_id,study_id,transcript_xref,ws).then(getPromises=>{
    Promise.all(getPromises).then(data=>{
      data instanceof Error ? console.log(data) : console.log(data)
      data.forEach(entry=>{
        if(entry instanceof Error){
          ws.sendMsg(JSON.stringify({error:entry.message}))
        }
      })
      /**
      if (result instanceof Error ){res.status(500).json(result)}else{
        success=0
        failure={num:0,lines:[]}
        result.forEach(entry=>{
          if (entry instanceof Error){
            entry.msg=entry.message
            failure.num++
            failure.lines.push(entry)
          }else{
            success++
          }
        })
        res.json({success,failure})
      }    **/
    }).catch(function(error){
      console.log(error)
    })  

  })
})

router.post('/targets/get/db/sequence/target/:study_id',function(req,res){
  options=Object.assign({},{params:req.params,body:req.body,query:req.query})
  getTargets(options).then(data=>{
    res.json(data)
  }).catch(err=>{
    res.json(data)
  })
})

module.exports = router;