const express = require('express');
const router = express.Router();
const upload_data=require('./../components/forms/upload_data')
const path=require('path')
const marked=require('marked')
const fs=require('fs')
const rand = require('csprng')
const glob = require('glob')

const uploadDir=path.join(__dirname, '../uploads');
const destinationFolderRawReads = "logs"

router.post('/logs/upload',function(req,res){
  let randomPath=rand(160,36)+rand(160,36)
  req.params.studyId="miRPursuit/"+randomPath+"/"
  upload_data.uploadFile(req,uploadDir,destinationFolderRawReads).then(result=>{
    result instanceof Error ? res.status('400').json(result) : res.send("https://srna-portal.biodata.pt/mirpursuit/logs/"+randomPath+"/\n")
  }).catch(err=>{
    res.status('500').json('err')
  })
})

router.get('/logs/:hash',function(req,res){
  let hash=req.params.hash
  let fileLocations=`${__dirname}/../uploads/miRPursuit/${hash}/logs/`
  let logs=glob.sync(fileLocations+"*")
  let filename=path
  let listMiRPursuitLogFiles=[]
  logs.forEach(log=>{
    listMiRPursuitLogFiles.push({file:path.basename(log),url:path.basename(log)})
  })
  res.render('logreader',{hash,listMiRPursuitLogFiles})
})

router.get('/logs/:hash/:log',function(req,res){
  let hash=req.params.hash
  let logFile=req.params.log
  let fileLocations=`${__dirname}/../uploads/miRPursuit/${hash}/logs/`
  fs.readFile(`${fileLocations}/${logFile}` , function(err,data){
    if(err) res.render("error",{error:err});
    let logs=glob.sync(fileLocations+"*")
    let filename=path
    let listMiRPursuitLogFiles=[]
    logs.forEach(log=>{
      listMiRPursuitLogFiles.push({file:path.basename(log),url:path.basename(log)})
    })  
    logFile=marked(data.toString());
    res.render('logreader',{hash,logFile,listMiRPursuitLogFiles})
  })
})

module.exports = router;