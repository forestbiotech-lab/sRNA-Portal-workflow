var express = require('express');
var router = express.Router();
var formidable = require('formidable')
var fs = require('fs')
var path=require('path')
var detect =require('detect-file-type');
var saveSequence = require('./../components/miRNADB/saveSequence')
var convertFileToMatrix=require('./../components/preProcessing/convertFileToMatrix')

const uploadDir=path.join(__dirname, '../uploads/de_matrices');

router.get('/',function(req,res){
	res.render('differential_expression');
})

router.get('/raw-read-matrix',function(req,res){
	res.render('de/rawreadmatrix')
})
//POST UPLOAD                                     POST UPLOAD    //RESTRICT access required
router.post('/upload', function(req, res){
  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = false;

  //Calculate file hash
  form.hash = 'md5';
  console.log(__dirname);

  // store all uploads in the /uploads directory
  form.uploadDir = uploadDir;

  // every time a file has been uploaded successfully,
  // rename it to it's original name
  form.on('file', function(field, file) {
  	detect.fromFile(file.path,function(err,result){
  		if (err) res.render('error',err);
  		if (result===null){
  			fs.rename(file.path, path.join(form.uploadDir, file.name), (err)=>{
  				if(err) res.render('error',err);
  				file={hash:form.openedFiles[0].hash, name:form.openedFiles[0].name}
    			res.json(file);
  			});
  		}else{
  			console.log('this is not the right file type')
  			fs.unlink(file.path, (err)=>{
  				err ? res.render('error',err) : res.json({hash:'',name:"UnsupportedFile"})
  			})
  		}	
  	})
  });
  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
    res.render('error',err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
  	//Not necessary for single file
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

router.post('/uploaded-file',function(req,res){ 	 
  let uploadedFilename=req.body.filename
  let studyId=req.body.studyId
  if( req.body.responseType=="json"){
    var filePath=path.join(uploadDir, uploadedFilename)
    convertFileToMatrix(studyId,filePath).then(function(data){
      data instanceof Error ? res.status(404).json(err) : res.json(data)
    }).catch(function(err){
      res.status(404).json(err)
    }) 
  }else{
    res.render('de/uploadedFile',{uploadedFilename});
  }
})

router.put('/uploadMatrix',function(req,res){
  console.log(req.body.dataset)
  let dataset=req.body.dataset
  matrixUploadController(dataset).then(function(data){
		res.json(data)
	}).catch(function(err){
		res.status(500).json(err)
	})
})

module.exports = router;