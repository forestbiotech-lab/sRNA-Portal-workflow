var db = require('./../sqldb/index');
const path=require('path')
const fs=require('fs')
const uploadDir=path.join(__dirname, '../../../uploads');
const destinationFolderTargets = "targets"




//Common block
// TODO rename attributes for general use
// Receive the file path instead of the name and build here
const MAX_TRANSACTIONS=2
const MINSIZE=2;
var FILE_LINES;


function loadAugmentFile(filePath,insertAttributes,ws){
  return new Promise((res,rej)=>{  
    let fileName=path.basename(filePath)  
    fs.readFile(filePath,'utf8', (err, data) => {
      if (err) rej(err);
      let lines=data.split("\n")
      let fieldOfPromises=[]
      let results=[]
      insertAttributes.index=lines.length
      FILE_LINES=index
      insertAttributes.date=new Date()
      insertAttributes.fileName=fileName
      res(insertControl(fieldOfPromises, results, lines, insertAttributes,ws))
  	}) 
  })
}

function insertControl(fieldOfPromises, results, lines, insertAttributes,ws){
  while(fieldOfPromises.length<MAX_TRANSACTIONS && lines.length >0){
    line=lines.pop() //Removes header
    line=line.split("\t")
    if(line.length>MINSIZE) fieldOfPromises.push(insertLine(line, insertAttributes, ws))
    index--
    ws.sendMsg(JSON.stringify({msg:{percentageComplete:(100*(FILE_LINES-index)/FILE_LINES)}}))
  }
  if(fieldOfPromises.length>0){
    return Promise.all(fieldOfPromises).then(transactions=>{
      results.push(transactions)
      fieldOfPromises=[]
      console.log(index)
      return insertControl(fieldOfPromises, results, lines, insertAttributes, ws)
    })
  }else{
    return results.flat() 
  }
}
//Common block

function insertLine(line, insertAttributes,ws){
  let augmentFile, studyId,key,updateValues, index, date, metadata;
  studyId=insertAttributes.studyId
  index=insertAttributes.index
  data=insertAttributes.date
  key=insertAttributes.key
  updateValues=insertAttributes.updateValues
  metadata={
    index,
    date,
  }


  let keyValue=line[key.column]
  let updateValue=line[updateValues[0].column] //Go through array 
  

  return db.sequelize.transaction().then(function(t){

    try{
      augmentTargets(keyValue,studyId,updateValue,metadata,t).then(res=>{
        if(res instanceof Error) throw res 
        return t.commit().then(()=>{
          let status={
            name:"Success",
            message:`Line number: ${metadata.index} updated with success for key value ${keyValue}!`,
            //created:targetCreation.created,
            //referenced:targetCreation.referenced
          }
          ws.sendMsg(JSON.stringify(status))
          return status;
        })
      }).catch(err=>{
        return t.rollback().then(()=>{
          ws.sendMsg(JSON.stringify({error:`Update Error - Occured when trying to update with line ${metadata.index} for key value ${keyValue}. Error message: ${err.message}`}))            
        })  
      })
    }catch(err){
      return t.rollback().then(()=>{
        ws.sendMsg(JSON.stringify({error:`An error was generated while attempting find results for line ${metadata.index}, key value ${keyValue}. Error message: ${err.message}`}))            
      })  
    }
  })
}
  
module.exports=loadAugmentFile

function augmentTargets(keyValue,studyId,updateValue,metadata,t){
  return query(keyValue,studyId,t).then(id=>{
    return update(id,updateValue,metadata,t)
  })
} 

function update(id,updateValue,metadata,t){
  return db["Target"].update(
    {
      target_description:updateValue,
    },{
      where:{
        id:id
      }
    },{
      transaction:t
    }
  ).then(dbModel=>{
    metadata.id=id
    return {dbModel,metadata}
  }).catch(err=>{
    console.log(err)
    return err
  })
}

function query(keyValue,studyId,t){
  return db['Target'].findOne({
    include:[{
      model: db['Transcript'],
      where:{
        accession:keyValue
      }
    }],
    where:{
      study_id:studyId
    }
  }).then(res=>{
    try{
      return res.dataValues.id
    }catch(err){
      return -1
    }
  })
}