var db = require('./../sqldb/index');
var transactionModels=require('./../transactions/models')

const fs = require('fs')
const MINSIZE=2
const PREVIEW_LINES=10
const MAX_TRANSACTIONS=4

var totalLines;
var successes=0
var errors=0

module.exports={saveRawReads}

function saveRawReads(dataset,ws){
  let studyId=dataset.studyId
  let rawReadsfilename=dataset.rawReadsfilename
  let killLines=dataset.killLines
  let rawReadsFilePath=dataset.rawReadsFilePath
  return new Promise((res,rej)=>{  
    fs.readFile(rawReadsFilePath,'utf8', (err, data) => {
      if (err) rej(err);
      let lines=data.split("\n")
      let header=lines[0].split("\t")
      header.shift()
      header.shift()
      createAssays(header,studyId,rawReadsfilename).then(assayIds=>{
        lines.shift()
        totalLines=lines.length
        let fieldOfPromises=[]
        let results=[]
        let index=lines.length
        let date=new Date()
        res(insertControl(fieldOfPromises, results, lines, rawReadsfilename, studyId, index, date, assayIds,ws))
      },rejection=>{
        rej(rejection)
      })
    }) 
  })
}

function insertControl(fieldOfPromises,results,lines,rawReadsfilename,study_id,index, date,assay_ids,ws){
  while(fieldOfPromises.length<MAX_TRANSACTIONS && lines.length >0){
    line=lines.pop()
    line=line.split("\t")
    if(line.length>MINSIZE) fieldOfPromises.push(insertLine(rawReadsfilename,line,study_id,index,date,assay_ids,ws))
    index--
  }
  
  if(fieldOfPromises.length>0){
    return Promise.all(fieldOfPromises).then(transactions=>{
      results.push(transactions)
      fieldOfPromises=[]
      let percentageComplete=(1-(index/totalLines))*100
      updateTransactionsStatus(transactions)
      let msg=JSON.stringify({percentageComplete,successes,errors})
      ws.sendMsg(msg)
      return insertControl(fieldOfPromises, results, lines, rawReadsfilename, study_id, index, date, assay_ids,ws)
    })
  }else{
    let msg=JSON.stringify({percentageComplete:100,successes,errors})
    ws.sendMsg(msg)
    return results.flat()
  }
}

function insertLine(filename,line,study_id,index,date,assay_ids){
  let lineNum=index
  let sequence=line.shift().trim()
  let name=line.shift().trim()
  let accession=genAccession(name)
  let rawCounts=line
  let version=getVersion()
  let metadata={filename,lineNum,sequence,study_id,assay_ids,date,version}
  mature_attributes={accession,name}
  return db.sequelize.transaction().then(function(t){

    function searchSequenceId(sequence,type,transaction){
      let attributes={
        tablename:"Mature_miRNA_sequence",
        where:{sequence},
        transaction
      }
      return transactionModels.getTableValuesWhere(attributes).then(model=>{
        return extractId(model,type)
      })      
    } 
    function createSequence(sequence,transaction){
      let attributes={
        tablename:"Mature_miRNA_sequence",
        inserts:Object.assign({},sequence),
        transaction
      }
      return transactionModels.saveSingleTableDynamic(attributes).then(model=>{
        return extractId(model)
      })      
    }

    function searchSequenceAnnotation(sequence_id,transaction){
      let attributes={
        tablename:"Mature_miRNA",
        where:{sequence_id},
        transaction
      }
      return transactionModels.getTableValuesWhere(attributes).then(model=>{
        return extractId(model)
      })
    }


    function getOrCreateSequence(metadata,sequence,transaction){
      let err=function(){
        setCustomError("Sequence", metadata.sequence, metadata.lineNum, metadata.filename)
      }
      return searchSequenceId(sequence, type="try", transaction).then(sequence_id=>{
        if( sequence_id > -1){
          return sequence_id
        }else{
          return createEntry("Mature_miRNA_sequence",{sequence}, transaction,err)
        }
      })
    }

    function createMature(metadata, sequence_id,mature_attributes,transaction){
      let err=function(){
        setCustomError("Mature_miRNA", metadata.sequence, metadata.lineNum, metadata.filename)
      }
      let tablename='Mature_miRNA'
      let insert_attributes=Object.assign({sequence_id},mature_attributes)
      return createEntry(tablename,insert_attributes,transaction,err)
    }

    function createAssayData(metadata,assayData_attributes,transaction){
      let err=function(){
        setCustomError("AssayData", metadata.sequence, metadata.lineNum, metadata.filename)
      }
      let tablename='Assay_data'
      let insert_attributes=Object.assign({},assayData_attributes)
      return createEntry(tablename,insert_attributes,transaction,err)
    }
    function createAnnotation(metadata,annotation_attributes,transaction){
      let err=function(){
        setCustomError("Annotation", metadata.sequence, metadata.lineNum, metadata.filename)
      }
      let tablename='Annotation'
      let insert_attributes=Object.assign({},annotation_attributes)
      return createEntry(tablename,insert_attributes,transaction,err)
    }

    function createAnnotationAndAssay_data(metadata,mature_miRNA_id,rawCounts,transaction){
      ids=[]
      rawCounts.forEach((raw,index)=>{
        let assayData_attributes={assay:metadata.assay_ids[index],raw:raw.trim()}
        ids.push(createAssayData(metadata,assayData_attributes,transaction).then(assay_data_id=>{
          let annotation_attributes={
            mature_miRNA_id,
            date:metadata.date,
            version:metadata.version,
            assay_data_id,
          }
          return createAnnotation(metadata,annotation_attributes,transaction).then(annotation_id=>{
            return {annotation_id,assay_data_id}
          }) 
        }))
      })
      return Promise.all(ids)
    }
    //TODO iterate over each line creating an assay_data and an annotation_attributes
    //Build these attribute objects
    //Depends on the creation of the Mature_miRNA
    //Requires a function that dos 

    function newSequence(metadata,sequence,mature_attributes,rawCounts,transaction){
      return getOrCreateSequence(metadata,sequence,transaction).then(sequence_id=>{
        return createMature(metadata, sequence_id, mature_attributes, transaction).then(mature_id=>{
          return createAnnotationAndAssay_data(metadata,mature_id,rawCounts,transaction).then(annotation_data=>{
            return {sequence_id,lineNum,created:{sequence_id,mature_id,annotations:annotation_data},referenced:{study_id:metadata.study_id}}
          })
        })
      })      
    }

    return newSequence(metadata,sequence,mature_attributes,rawCounts,t).then(function(sequenceCreation){
//      return t.rollback().then(()=>{
      return t.commit().then(()=>{
        let status={
          name:"Success",
          message:`Line number: ${sequenceCreation.lineNum} inserted with success!`,
          created:sequenceCreation.created,
          referenced:sequenceCreation.referenced
        }
        return status;
      })
    }).catch(function (err) {
      return t.rollback().then(a=>{
        return err
      })
    });
  })
  function genAccession(name){
    //TODO something
    return name
  }
  function getVersion(){
    return 1
  }
}

function createAssays(headers,study,filename){
  return new Promise((res,rej)=>{
    return db.sequelize.transaction().then(function(t){
      let assay_ids=[]
      headers.forEach(col=>{  
        let tablename="Assay"
        let name=col.trim()
        let attributes={study,name}
        let metadata={name,lineNum:1,filename}
        let err=function(){
          setCustomError("Assay", metadata.name, metadata.lineNum, metadata.filename)
        }
        assay_ids.push(createEntry(tablename,attributes,t,err))
      })
      Promise.all(assay_ids).then(assays=>{
        t.commit().then(()=>{
          res(assays)
        })
      },rejection=>{
        t.rollback().then(()=>{
          rej(rejection)
        })
      }).catch(err=>{
        t.rollback().then(()=>{
          rej(err)
        })      
      })
    })
  })
}

function createEntry(tablename,insert_attributes,transaction,err){
  let attributes={
    tablename,
    inserts:insert_attributes,
    transaction
  }
  return transactionModels.saveSingleTableDynamic(attributes).then(model=>{
    return extractId(model,err)
  })     
}

function setCustomError(name,element,file_line,input_file){
  let error=new Error(`${name} "${element}" not found! - Rollback has been triggered for this line`)
  error.description={file_line,input_file}
  throw error
}
function extractId(model,type,err){
  err = typeof type == "string" ? err : type 
  let id=""
  try{
    if(model instanceof Array ){
      if (model.length == 0){
        id=-1
      }else{
        id=model[0].dataValues.id
      }
    }else{
      id=model.dataValues.id
    } 
    return id
  }
  catch(error){
    if(type=="try"){
      return id=-1
    }else{
      if(err) err() 
      new Error('Rollback triggered - Create failed! Or at least produced no id')
    }
  }     
}

function updateTransactionsStatus(transactions){
  transactions.forEach(transaction=>{
    if(transaction.name=="Success"){
      successes++
    }else{
      errors++
    }
  })
}

