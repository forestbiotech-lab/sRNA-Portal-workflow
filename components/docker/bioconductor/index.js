var Docker = require('dockerode');
var docker = new Docker({socketPath: '/var/run/docker.sock'});
function imageExists(tag){
  return docker.listImages().then(
    data=>{
      let result=false
      data.forEach(datum=>{
        if(datum.RepoTags[0].split(':')[0]==tag){
          result=true
        }
      })
      return result
    },rejection=>{
      return false
    }
  ) 
}

function getImageIDbyTag(){

}

function startImage(){

}
function stopImage(){

}

function importData(){

}
function exportData(){

}
//modify container to have edgeR installed

function runAnalysis(containerName,study){
 return docker.run(
    containerName,
    ['Rscript', 'de.rscript','--study',`${study}`,],
    [process.stdout, process.stderr], {Tty:false}, //send only stdout if you don't want the split no tty needed
  ).then(function(data){
      var output=data[0]
      var container=data[1]
      console.log(output.StatusCode)
      return container
    },rej=>{
      console.log({rej})
      return rej
    }
  )
}

function buildImage(name,ws){
   return docker.buildImage({
     context: "components/docker/bioconductor",
     src: ['Dockerfile','de.rscript'],
   },{t: name})  
}

function removeContainer(){

}

function getPCA(container,ws){
  getFile(container,"/usr/src/app/PCA_Log_Color-factor_shape-modalites.svg",ws)
}
function getHeatmap(container,ws){
  getFile(container,"/usr/src/app/Heatmap-log.svg",ws)
}
function getMDS(container,ws){
  getFile(container,"/usr/src/app/plotMDS.png",ws)
}
function getMDplot(container,ws){
  getFile(container,"/usr/src/app/plotMD.png",ws)
}
function getSummary(container,ws){
  getFile(container,"/usr/src/app/summary.tsv",ws)
}
function getQLDisp(container,ws){
  getFile(container,"/usr/src/app/plotQLDisp.png",ws)
}
function getBCV(container,ws){
  getFile(container,"/usr/src/app/plotBCV.png",ws)
}
function getTopTags(container,ws){
  getFile(container,"/usr/src/app/topTags.tsv",ws)
}
function getFile(container,file,ws){
  container.getArchive({path:file}).then(file=>{
    if(ws) ws.sendMsg(file)
  })
}

module.exports=function(ws){
  //build image
  let study=1
  return new Promise(async (res,reject)=>{
    let tag="srnaplantportal/de_15"
    ws.sendMsg("Searching image!")
    if(await imageExists(tag)){
      runFun(res,reject,ws,tag,study)
    }else{
      if(ws) ws.sendMsg("Starting to build image!")
      buildImage(tag,ws).then(output=>{
        output.pipe(process.stdout)
        output.on('end', () => {
          if(ws) ws.sendMsg("Finished building image!")
          runFun(res,reject,ws,tag,study)
        });//function for on end
      },rej=>{
        if(ws) ws.sendMsg("Error: Problem building image! "+rej)  
        reject("Error"+err)      
      })
    }
  })
}

function runFun(res,reject,ws,tag,study){
  let getFiles=[]
  ws.sendMsg("Running analysis!")
  runAnalysis(tag,study).then(container=>{
    getPCA(container,ws)
    getHeatmap(container,ws)
    getMDS(container,ws)
    getQLDisp(container,ws)
    getBCV(container,ws)
    getMDplot(container,ws)
    getSummary(container,ws)
    getTopTags(container,ws)
    
    /*getFiles.push(getMDS(container))
    getFiles.push(getBCV(container))
    getFiles.push(getQLDisp(container))
    getFiles.push(getMDplot(container))
    getFiles.push(getSummary(container))
    getFiles.push(getTopTags(container))
    Promise.all(getFiles).then(files=>{
      files.forEach(file=>{
        ws.sendMsg(file)  
      })*/
      container.remove().then(data=>{
        console.log("container removed!")
        ws.sendMsg("Container removed!")
        res("Container removed!")
      },rej=>{
        reject("Error: Removing container - "+rej)
      })
/*    },rej=>{
      console.log("Rejection on all promises")
      ws.sendMsg("Error: "+rej)
      reject("Error: "+rej)
    })*/
  },rej=>{
    console.log("Rejection on analysis:"+rej)
    ws.sendMsg("Error: "+rej)
    reject("Error: "+rej)
  })
}