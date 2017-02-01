var express = require('express');
var router = express.Router();
var formidable = require('formidable')
var fs = require('fs');
var path = require('path');
var miRPursuit = require('./../views/strings/miRPursuit.json') 
var config = require('./../config/ontologies.json') 
var Promise = require("bluebird");
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
		var output=[];		

		function bioportal(http){ 
			return new Promise(function(resolve, reject){ 					
				////////////////////////////////////////////////////////
				var reqPlainBio=http.request(optionsBioportal,function(resPlain){
					//NEEDS WORK HERE
					console.log("Got response: " + resPlain.statusCode);

					if(res.statusCode == 200 || 404) {
		    			console.log("Got value (Bio): " + resPlain.statusMessage);
		    			//Make sure you have the right thing
						//if(res.headers.contentType=="application/json;charset=utf-8"){
							var body = '';
							resPlain.on("data",function(chunk){
								body+= chunk;
							})
							resPlain.on("end",function(){
								console.log('ended');
								var data={bioportal: JSON.parse(body).collection};
								//If all goes right callback function with var data;
								resolve(data);
							})
		  		  	}else{
		  		  		reject();
		  		  	}
				});
				//reqPlain.write("q="+fields.term);
				reqPlainBio.write("q="+req.query.term);
				console.log(req.query.term);
				reqPlainBio.end();
				/////////////////////////////////////////////////////////7
			})
		}
		function agroportal(http){ 
			return new Promise(function(resolve, reject){ 					
				////////////////////////////////////////////////////////
				var reqPlainAgro=http.request(optionsAgroportal,function(resPlain){
					//NEEDS WORK HERE
					console.log("Got response : " + resPlain.statusCode);

					if(res.statusCode == 200 || 404) {
		    			console.log("Got value (Agro callback): " + resPlain.statusMessage);
		    			//Make sure you have the right thing
						//if(res.headers.contentType=="application/json;charset=utf-8"){
							var body = '';
							resPlain.on("data",function(chunk){
								body+= chunk;
							})
							resPlain.on("end",function(){
								console.log('agro ended');
								var data={agroportal: JSON.parse(body).collection};
								//If all goes right callback function with var data;
								resolve(data);
							})
		  		  	}else{
		  		  		reject();
		  		  	}
				});
				//reqPlain.write("q="+fields.term);
				reqPlainAgro.write("q="+req.query.term);
				console.log(req.query.term);
				reqPlainAgro.end();
				/////////////////////////////////////////////////////////7
			})
		}
		output.push(agroportal(http));
		output.push(bioportal(http));

//		console.log(bioportal(http).then(function(success){console.log(success);}));
		/*var reqPlainAgro = http.request(optionsAgroportal,function(resPlain){
			//NEEDS WORK HERE
			console.log("Got response (Agro): " + resPlain.statusCode);

			if(res.statusCode == 200 || 404) {
    			console.log("Got value: " + resPlain.statusMessage);
    			//Make sure you have the right thing
				//if(res.headers.contentType=="application/json;charset=utf-8"){
					var body = '';
					resPlain.on("data",function(chunk){
						body+= chunk;
					})
					resPlain.on("end",function(){
						
						res.json({agroportal: JSON.parse(body).collection});	
					})
  		  	}
		});
		//reqPlain.write("q="+fields.term);
		reqPlainAgro.write("q="+req.query.term);
		console.log(req.query.term);
		reqPlainAgro.end();
		*/



		//if all else set these two for promise.
		Promise.all(output).then(function(data){
			res.json({"agroportal":data[0].agroportal,"bioportal":data[1].bioportal});
			//console.log(data);

		});

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
