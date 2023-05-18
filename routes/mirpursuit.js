const express = require('express');
const router = express.Router();
const upload_data=require('./../components/forms/upload_data')
const path=require('path')
const marked=require('marked')
const fs=require('fs')
const rand = require('csprng')
const glob = require('glob')
const fullAccess = require("../components/auth/fullAccess");
const Promise = require("bluebird");
const {exec} = require("child_process");
const miRPursuitVars = require("../config/miRPursuit.json");
const btoa = require("btoa");
const miRPursuit = require("../views/strings/miRPursuit.json");

const uploadDir=path.join(__dirname, '../uploads');
const destinationFolderRawReads = "logs"


router.get('/miRPursuit', fullAccess, function(req, res, next) {
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

// ################# MOVED from index ## ajust links to include /mirpursuit
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
/// End moved from index route ///

module.exports = router;