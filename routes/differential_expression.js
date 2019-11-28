var express = require('express');
var router = express.Router();
var formidable = require('formidable')
var fs = require('fs')
var path=require('path')
var detect =require('detect-file-type');
var saveSequence = require('./../components/miRNADB/saveSequence')

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
  var filePath=path.join(uploadDir, req.body.filename)
  fs.readFile(filePath,'utf8', function(err,data){
    //Calculate hash for each line
    var dataString=data.toString().split(/\r*\n/) 
    var result=[]
    for (line in dataString){
      result.push(dataString[line].split("\t"))
    }
    let header=result[0]
    let body=result.splice(1)
    console.log({body,header})
  	err ? res.render(error,err) : res.render('de/uploadedFile',{header,body});
  })
})

router.put('/savetodatabase',function(req,res){
	console.log(req.body)
	saveSequence(req.body).then(function(data){
		res.json(data)
	}).catch(function(err){
		res.status(404).json(err)
	})
})
module.exports = router;