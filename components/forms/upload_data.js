var fs=require('fs')
var path=require('path')
var formidable=require('formidable')
var detect=require('detect-file-type')
var formidable = require('formidable')
var processTargetsFile=require('./../miRNADB/targets/targetsFileActions')

function uploadFile(req,uploadDir,destination){
  return new Promise((res,rej)=>{

    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = false;
    //Calculate file hash
    form.hash = 'md5';
    form.studyId = ''
    // store all uploads in the /uploads directory
    form.uploadDir = uploadDir

    // every time a file has been uploaded successfully,
    // rename it to it's original name
    form.on('file', function(field, file) {
      detect.fromFile(file.path,function(err,result){
        if (err) rej(err)
        if (result===null){
          let destinationDir=path.join(uploadDir,`/${req.params.studyId}/${destination}`)
          let destinationFile=path.join(destinationDir, file.name)
          fs.exists(destinationDir, (exists)=>{
            if(exists){
             rename(file.path, destinationFile) 
            }else{
              fs.mkdir(destinationDir, { recursive: true }, (err)=>{
                if (err){ 
                  rej(err);
                }else{
                  rename(file.path, destinationFile)  
                }
              })  
            }
            function rename(inFile,outFile){
              fs.rename(inFile,outFile, (err)=>{
                if(err){
                  rej(err);
                }else{
                  file={hash:form.openedFiles[0].hash, name:form.openedFiles[0].name}
                  res(file)
                }
              });
            }
          })          
        }else{
          fs.unlink(file.path, (err)=>{
            err ? rej(err) : res({hash:'',name:"UnsupportedFile"}) 
          })
        } 
      })
    });

    // log any errors that occur
    form.on('error', function(err) {
      rej(err);
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
      //Not necessary for single file
    });

    // parse the incoming request containing the form data
    form.parse(req);

  })
}


function uploadTargets(req,uploadDir,destination){
  return new Promise((res,rej)=>{
      // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = false;
    //Calculate file hash
    form.hash = 'md5';
    // store all uploads in the /uploads directory
    form.uploadDir = uploadDir;

    // every time a file has been uploaded successfully,
    // rename it to it's original name
    form.on('file', function(field, file) {
      detect.fromFile(file.path,function(err,result){
        if (err) rej(err);
        if (result===null){
          let destinationDir=path.join(uploadDir,`/${req.params.studyid}/${destination}`)
          let destinationFile=path.join(destinationDir, file.name)
          fs.exists(destinationDir, (exists)=>{
            if(exists){
             rename(file.path, destinationFile) 
            }else{
              fs.mkdir(destinationDir, { recursive: true }, (err)=>{
                if (err){ 
                  rej(err);
                }else{
                  rename(file.path, destinationFile)  
                }
              })  
            }
            function rename(inFile,outFile){
              fs.rename(inFile,outFile, (err)=>{
                if(err){
                  rej(err);
                }else{
                  file={hash:form.openedFiles[0].hash, name:form.openedFiles[0].name}
                  processTargetsFile.getPreview(outFile,0).then(result=>{
                    result instanceof Error ? rej(result) : res({filePreview:result,file});             
                  })
                }
              });
            }
          })          
        }else{
          fs.unlink(file.path, (err)=>{
            err ? rej(err) : res({hash:'',name:"UnsupportedFile"})
          })
        } 
      })
    });
    
    // log any errors that occur
    form.on('error', function(err) {
      console.log('An error has occured: \n' + err);
      rej(err);
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
      //Not necessary for single file
    });

    // parse the incoming request containing the form data
    form.parse(req);

  })
}



module.exports={uploadFile,uploadTargets}








