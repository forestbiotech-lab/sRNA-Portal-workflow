var express = require('express');
var router = express.Router();
var formidable = require('formidable')
var fs = require('fs');
var path = require('path');
var miRPursuit = require('./../views/strings/miRPursuit.json') 
var config = require('./../config/ontologies.json') 
var https = require('https');
var http = require('http');
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

router.post('/test',function(req,res){
	console.log(req.params);
	console.log(req.query);
	res.status(200).json(config);
})

router.post('/search-term',function(req,res){
	console.log(req.query.term);
	var optionsBioportal = {
		host: config.termSearch.bioportal.HOST,
		port: '80',
		path: config.termSearch.bioportal.PATH,
		method: 'POST',
		headers: {
			'Authorization': config.Authorization+process.env.bioportalKey,
			'Content-Type': 'application/x-www-form-urlencoded'//,
    		//'Content-Length': post_data.length
		}
	}
	var optionsAgroportal = {
		host: config.termSearch.agroportal.HOST,
		port: '80',
		path: config.termSearch.agroportal.PATH,
		method: 'POST',
		headers: {
			'Authorization': config.Authorization+process.env.agroportalKey,
			'Content-Type': 'application/x-www-form-urlencoded'//,
    		//'Content-Length': post_data.length
		}
	}
	var optionsTEST = {
		host: "localhost",
		port: "3000",
		path: "/test",
		method: 'POST',
		headers: {
			'Authorization': config.Authorization+process.env.agroportalKey,
			'Content-Type': 'application/x-www-form-urlencoded'//,
    		//'Content-Length': post_data.length
		}
	}


//Buffer if needed
	var read_buffer;
	read_buffer = function(buffer, callback) {
	  var data;
	  data = '';
	  buffer.on('readable', function() {
	    return data += buffer.read().toString();
	  });
	  return buffer.on('end', function() {
	    return callback(data);
	  });
	};
//end Buffer if needed


	var form = new formidable.IncomingForm();
	form.encoding = 'utf-8';
	form.parse(req, function(err,fields, files){
		//console.log(fields);
		//Get term from specific id

		var reqPlain = http.request(optionsBioportal,function(resPlain){
		
			console.log("Got response: " + resPlain.statusCode);

			if(res.statusCode == 200 || 404) {
    			console.log("Got value: " + resPlain.statusMessage);
    			//Make sure you have the right thing
				//if(res.headers.contentType=="application/json;charset=utf-8"){
					var body = '';
					resPlain.on("data",function(chunk){
						body+= chunk;
					})
					resPlain.on("end",function(){
						res.json({bioportal: JSON.parse(body).collection});	
					})
  		  	}
		});
		//reqPlain.write("q="+fields.term);
		reqPlain.write("q="+req.query.term);
		console.log(req.query.term);
		reqPlain.end();


	})
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
