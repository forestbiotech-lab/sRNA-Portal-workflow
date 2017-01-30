var express = require('express');
var router = express.Router();
var formidable = require('formidable')
var fs = require('fs');
var path = require('path');
var miRPursuit = require('./../views/strings/miRPursuit.json') 
var config = require('./../config/ontologies.json') 

//local only
process.env.local ? require('./../.env') : ""; 
//process.env.local ? console.log(process.env): "";



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
/* GET home page. */
router.get('/miRPursuit', function(req, res, next) {
  res.render('miRPursuit', {lang:"en",text: miRPursuit.en});
});

router.post('/search-term',function(req,res){
	//console.log(req);
	var form = new formidable.IncomingForm();
	form.encoding = 'utf-8';
	form.parse(req, function(err,fields, files){
		console.log(fields);
		//Get term from specific id



	})
	console.log(form);
	var options = {
		host: config.termSearch.bioportal.HOST,
		port: '80',
		path: config.termSearch.bioportal.PATH,
		method: 'POST',
		headers: {
			'Authorization': config.Authorization+"token",//+process.env.agr
			'Content-Type': 'application/x-www-form-urlencoded'//,
    		//'Content-Length': post_data.length
		}

	}
	console.log(options);
	res.send('ok');
})

router.post('/upload', function(req, res){
  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;
  console.log(__dirname);

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '../uploads');
  
  // every time a file has been uploaded successfully,
  // rename it to it's original name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);

});




module.exports = router;
