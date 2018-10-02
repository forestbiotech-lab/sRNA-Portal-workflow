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
var exec = require('child_process').exec;
var miRPursuitVars= require('./../config/miRPursuit.json');
var atob=require('atob');
var btoa=require('btoa');
var Cookies = require('cookies');
var Keygrip = require("keygrip");
var keylist=["SEKRIT2", "SEKRIT1"];
var keys = new Keygrip(keylist,'sha256','hex')
var token="qawsaffsfkjahf3728fh93qo38gfwqig3qq82gdq93yd9wqd39qdxeaiwhah";

var nameSearch = require('./../components/miRNADB/nameSearch');

//local only
process.env.local ? require('./../.env') : ""; 
//process.env.local ? console.log(process.env): "";

function fullAccess(req,res){
  var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
  if (req.cookies.apikey!=token){ 
    res.render('indexNoSidePanel', { title: 'Under construction!'})
    return false
  }else{
    return true
  }

}



/* GET home page. */
router.get('/', function(req, res, next) {
  var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
  var query = req.query;
  if (query.access=="full"){
    cookies.set( "access", token ).set( "apikey", token, { signed: true, maxAge: (1000 * 60 * 60 * 30 * 12) } );
    res.render('index', { title: 'Under construction!'});
  }else{
    if(fullAccess(req,res)) res.render('index', { title: 'sRNA Plant Portal'}) 
  }

});

/* GET home page. */     
router.get('/miRPursuit', function(req, res, next) {
  if (!fullAccess(req,res)) return null;
  //exec command and get promise
  function send(command){
    return new Promise(function(resolve, reject){
      exec(command, function(error,stdout,stderr){
        
        //If no stderr furfill promise else send stdr;
        stderr.length==0 || error===null ? resolve(stdout) : reject({error:error,stderr:stderr});
        //Implement error....... !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

      });
    });  
  }
  command="cat "+miRPursuitVars.miRPursuitPath+miRPursuitVars.workdirs;
  send(command).then(function(data){
    var config={};
    try{
      workdirs=data.trim().split(/\r?\n|\r/g);
      function configParseToJSON(item){
        item.startsWith('#') ? "" :  config[item.split('=')[0]]=btoa(item.split('=')[1]);  
      }
      workdirs.filter(configParseToJSON);
    }catch(exception){ 

      console.trace(exception);
      config={};
    }finally{
      res.render('miRPursuit', {lang:"en",text: miRPursuit.en,log:config,workdirs:config,miRPursuitPath:btoa(miRPursuitVars.miRPursuitPath)});
    }
  },function(err){
    //If promise isn't fullfilled issue error but render page. Set config to ""
    console.error("Error at index.js - "+err.stderr);
    process.env.LOG>4 ? console.error("Error at index.js - "+err.stderr) : "";
    var config={};
    res.render('miRPursuit', {lang:"en",text: miRPursuit.en,log:config,workdirs:config,miRPursuitPath:btoa(miRPursuitVars.miRPursuitPath)});
  });
});


// POST LIST                                          POST LIST
router.post('/list',function(req,res){
  //Gets a path to test
   function send(command){
    return new Promise(function(resolve, reject){
      exec(command, function(error,stdout,stderr){
        //on success;
        //trim if necessary.q
        stderr.length==0 || error===null ? resolve(stdout.trim().split(/\r?\n|\r/g)) : reject({error:error,stderr:stderr});
      });
    });  
  }

  //Some sanity should be done. Perhaps this isn't accessed directly.
  //And ID server looks up the path and the calculated path is sent by the server. With a hashed code to ensure origin is legit
  var path = req.query.path;
  command="ls "+path.replace(";","");
  send(command).then(function(data){
    res.json(data);
  });

})

// POST CAT                                                 POST CAT        low level restriction but could give potential access to files that it shouldn't
router.post('/cat',function(req,res){
  
  console.log(req.body);

  function send(command){
    return new Promise(function(resolve, reject){
      exec(command, function(error,stdout,stderr){
        //on success;
        //trim if necessary.
        stderr.length==0 || error===null ? resolve(stdout.trim()) : reject({error:error,stderr:stderr});
      });
    });  
  }

  //Some sanity should be done. Perhaps this isn't accessed directly.
  //And ID server looks up the path and the calculated path is sent by the server. With a hashed code to ensure origin is legit

  var path = atob(req.body.path);
  var file = atob(req.body.file);
  command='cat "'+path.replace(/["';,]/g,"")+file.replace(/["';,]/g,"")+'"';
  console.log(command);
  send(command).then(function(data){
    data=data.trim().split(/\r?\n|\r/g);
    res.json(data);
  });

})


// POST CAT                                                 POST CAT        low level restriction but could give potential access to files that it shouldn't
router.post('/run',function(req,res){
  
  console.log(req.body);

  function send(command){
    return new Promise(function(resolve, reject){
      exec(command, function(error,stdout,stderr){
        //on success;
        //trim if necessary.
        stderr.length==0 || error===null ? resolve(stdout.trim()) : reject({error:error,stderr:stderr});
      });
    });  
  }

  //Some sanity should be done. Perhaps this isn't accessed directly.
  //And ID server looks up the path and the calculated path is sent by the server. With a hashed code to ensure origin is legit

  var path = atob(req.body.path);
//  var file = atob(req.body.file); //If first time folder might not exist to store log. //temp fix for now.
  var command='mkdir -p '+path+'log'+';'+miRPursuitVars.miRPursuitPath+'./miRPursuit.sh -f 1 -l 2 --fasta - --no-prompt --headless 2>&1 > '+path+'log/TEST.log';
  //command='cat "'+path.replace(/["';,]/g,"")+file.replace(/["';,]/g,"")+'"';
  console.log(command);
  send(command).then(function(data){
    data=data.trim().split(/\r?\n|\r/g);
    console.log(data);
    //res.json(data);
  },function(err){
    //If promise isn't fullfilled issue error but render page. Set config to ""
    console.error("Error at index.js - "+err.stderr);
    process.env.LOG>4 ? console.error("Error at index.js - "+err.stderr) : "";
    var config={};
    //res.render('miRPursuit', {lang:"en",text: miRPursuit.en,log:config,workdirs:config,miRPursuitPath:btoa(miRPursuitVars.miRPursuitPath)});
  });
  res.send('OK');
})

// POST CAT                                                 POST CAT        low level restriction but could give potential access to files that it shouldn't
router.post('/progress',function(req,res){
  
  console.log(req.body);
  //ADD ID to post so we know what to look for Well for now path will do.
  function send(command){
    return new Promise(function(resolve, reject){
      exec(command, function(error,stdout,stderr){
        //on success;
        //trim if necessary.
        stderr.length==0 || error===null ? resolve(stdout.trim()) : reject({error:error,stderr:stderr});
      });
    });  
  }

  //Some sanity should be done. Perhaps this isn't accessed directly.
  //And ID server looks up the path and the calculated path is sent by the server. With a hashed code to ensure origin is legit

  var path = atob(req.body.path);
//  var file = atob(req.body.file);
  var command="cat "+path+"PROGRESS";
  //command='cat "'+path.replace(/["';,]/g,"")+file.replace(/["';,]/g,"")+'"';
  console.log(command);
  send(command).then(function(data){
    data=data.trim().split(/\t/g);
    var response={progress: data[0]+"%",state:data[1],step:data[2]};
    res.json(response);
  });
  //res.send('OK');
})


router.post('/test',function(req,res){
	console.log(req.params);
	console.log(req.query);
	res.status(200).json(config);
})


// POST SEARCH-TERM                                          POST SEARCH-TERM
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

		//if all else set these two for promise.
		Promise.all(output).then(function(data){
			res.json({"agroportal":data[0].agroportal,"bioportal":data[1].bioportal});
			//console.log(data);

		});

	})
})



//POST UPLOAD                                     POST UPLOAD    //RESTRICT access required
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

router.get('/db', function(req, res){
  if (!fullAccess(req,res)) return null;
  res.render('db', { title: 'Express',tableValues:[] });
})



//################################# Should be seperated #############################
var sequenceSearch = require('./../components/miRNADB/sequenceSearch');
router.get('/db/sequence/:sequence', function(req, res){
  fullAccess(req,res)
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



router.get('/db/name/:name', function(req, res){
  if (!fullAccess(req,res)) return null;
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

router.get('/areyouup', function(req, res, next) {
  res.json('yes');
});

//Security issues? this might allow rendering pages that it shouldn't allow.
router.get('/getParts/:part', function(req, res, next){
  res.render('parts/'+req.params.part);
})

module.exports = router;
