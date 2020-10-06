
function loadAugmentFile(augmentFile,otherArgs,ws){
  return new Promise((res,rej)=>{  
    fs.readFile(targetsFile,'utf8', (err, data) => {
      if (err) rej(err);
      let lines=data.split("\n")
      let fieldOfPromises=[]
      let results=[]
      let index=lines.length
      TARGETS=index
      let date=new Date()
      res(insertControl(fieldOfPromises, results, lines, targetsFile, genome_id, study_id,transcript_xref, index, date,ws))
  	}) 
  })
}