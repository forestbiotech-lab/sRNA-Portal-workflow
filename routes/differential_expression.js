var express = require('express');
var router = express.Router();
var formidable = require('formidable')
var fs = require('fs')
var path=require('path')
var Promise = require("bluebird");

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
  form.multiples = true;

  //Calculate file hash
  form.hash = 'md5';
  console.log(__dirname);

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '../uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's original name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name), function(){console.log("Rename done")});
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
  	file={hash:form.openedFiles[0].hash, name:form.openedFiles[0].name}
    res.json(file);
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

module.exports = router;