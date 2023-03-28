const db = require('./../sqldb/index');
const Op= require('sequelize').Op
var transactionModels=require('./../transactions/models')

const fs = require('fs')
const MINSIZE=1
const PREVIEW_LINES=10
const MAX_TRANSACTIONS=1  //Otherwise it looses track
const ACCESSION_PREFIX="MPMAT"

var totalLines;
var successes=0
var errors=0
var killList={}
var indexNovel=0
var indexTasi=0

module.exports={saveRawReads}

async function saveRawReads(dataset,ws){
  let {studyId,sequenceAssemblyComposite,rawReadsfilename,rawReadsFilePath,killList}=dataset //Essentially to list what is in it
  let metadata=dataset
  metadata.filename=rawReadsfilename//Simple rename

  metadata.lastNameTasi=await db["Feature"].findOne({
    attributes:[[db.sequelize.col('name'),'lastName']],
    order:[
      [
        db.sequelize.fn('length',db.sequelize.col('name')),
        'DESC'
      ],[
        db.sequelize.col('name'),
        'DESC'
      ]
    ],
    where:{
      "name":{ [Op.like]: "mirTASI%"}
    }
  })
  metadata.lastNameNovel=await db["Feature"].findOne({
    attributes:[[db.sequelize.col('name'),'lastName']],
    order:[
      [
        db.sequelize.fn('length',db.sequelize.col('name')),
        'DESC'
      ],[
        db.sequelize.col('name'),
        'DESC'
      ]
    ],
    where:{
      "name": {[Op.like]:"mirNOVEL%"}
  }})
  //TODO improve this. Sorting sucks ordering and getting first
  metadata.lastAccession=await db["Feature"].findOne({
    attributes:[[db.sequelize.col('accession'),'lastAccession']],
    order:[
      [
        db.sequelize.fn('length',db.sequelize.col('accession')),
        'DESC'
      ],[
        db.sequelize.col('accession'),
        'DESC'
      ]
    ],
    where:{
      "accession": {[Op.like]:ACCESSION_PREFIX+"%"}
    }
  })

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
        metadata.date=new Date()
        metadata.assay_ids=assayIds
        res(insertControl(fieldOfPromises, results, lines, index, metadata, ws))
      },rejection=>{
        rej(rejection)
      })
    }) 
  })
}

function screenLine(line,metadata){
  //
  // Break this into function 
  //
  if(line.length>MINSIZE){
    if(ofInterest(line)){
      let killListProperities=getKillListProperties(line)
      if(killListProperities.type=="duplicate"){
        if(killListProperities.occurrences){
          killListProperities.occurrences+=1
          return killLine()
        }else{
          killListProperities.occurrences=1
          return noAction(line)
        }
      }else if(killListProperities.type=="merge"){
        if(killListProperities.occurrences){
          killListProperities.occurrences+=1
          return killLine()
        }else{
          killListProperities.occurrences=1
          return substituteLine(killListProperities.substitute)
        }        
      }else{
        return noAction(line, metada)
      }
    }else{ 
      return noAction(line,metadata)
    }
  }else{ 
    return killLine()
  }
  

  function getKillListProperties(line){
    let sequence=line[0].trim()
    return killList[sequence]
  }
  function ofInterest(line){
    let sequence=line[0].trim()
    if (killList[sequence] === undefined){ 
      return false 
    }else{
      return true 
    }
  }

  let ExamplekillList={
    ATAGAGATRAG:{
      type:"duplicate/merge",               //*mandatory
      substitute:"",                        //*mandatory
      occurrences:0
    }
  }
  //Outcomes
  function killLine(){
    return {insertLine:false,line:[]}
  }
  function substituteLine(line){
    return {insertLine:true,line}
  }
  function noAction(line,metadata){
    sequenceType=""
    let classification=classifyLine(line,metadata)
    return {insertLine:true,line,classification}
  }
}

function classifyLine(line,metadata){
  let name=""
  if(line instanceof Array){
    name=line[1]
  }else if(line instanceof String){
    name=line
  }
  if(name.search(".*novel.*")!=-1){
    indexNovel++
    let matIndex=indexNovel
    if(metadata.lastName) {
      let lastName = metadata.lastNameNovel.dataValues.lastName
      if (lastName) {
        let search = lastName.match("[0-9]+")
        if (search) {
          matIndex = parseInt(search[0]) + indexNovel
        }
      }
    }
    return {tag:"novel",index: matIndex}
  }
  if(name.search(".*tasi.*")!=-1) {
    indexTasi++
    let matIndex = indexTasi
    if (metadata.lastName){
      let lastName = metadata.lastNameTasi.dataValues.lastName
      if (lastName) {
        let search = lastName.match("[0-9]+")
        if (search) {
          matIndex = parseInt(search[0]) + indexTasi
        }
      }
    }
    return {tag:"tasi",index:matIndex}
  }
  if(name.search("mi[rR].*")!=-1){
    return {tag:name,index:0}
  }

}
function insertControl(fieldOfPromises, results, lines, index, metadata, ws){
  try{
    while(fieldOfPromises.length<MAX_TRANSACTIONS && lines.length >0){
      line=lines.pop()
      line=line.split("\t")
      let screeningResult=screenLine(line,metadata)
      if (screeningResult.insertLine){
        line=screeningResult.line
        metadata.classification=screeningResult.classification
        metadata.index=index
        fieldOfPromises.push(insertLine(line,index,metadata,ws))
      }
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
        return insertControl(fieldOfPromises, results, lines, index, metadata, ws)
      })
    }else{
      let msg=JSON.stringify({percentageComplete:100,successes,errors})
      ws.sendMsg(msg)
      return results.flat()
    }
  }catch(err){
    return new Error(`Unable to add lines beyond ${index}!`)
  }
}


function genAccession(metadata){
  let accIndex=metadata.index
  if(metadata.lastAccession) {
    if (metadata.lastAccession.dataValues.lastAccession) {
      let search = metadata.lastAccession.dataValues.lastAccession.match("[0-9]+")
      if (search) {
        accIndex = parseInt(search[0]) + parseInt(metadata.index)
      }
    }
  }
  metadata.accession=ACCESSION_PREFIX+accIndex
  return metadata.accession
}
function genName(name,metadata) {
    return "mir" + metadata.classification.tag.toUpperCase() + metadata.classification.index
}
function buildAnnotationsForLine(line,index,metadata){
  function determineSource(name){
    //Since this point is dedicated for miRPursuit input all reads are miRPursuit for now.
    return "miRPursuit"
  }

  function getVersion(){
    return 1
  }

  metadata.lineNum=index
  metadata.sequence=line.shift().trim()
  //TODO deal with sequence annotation Lookup specs for miRProf
  let name=line.shift().trim()
  let sequence_assembly=metadata.sequenceAssemblyComposite.split(":")
  if(sequence_assembly.length!=2)
    throw new Error("MalformedSequencesAssemblyComposite")

  metadata.rawCounts=line
  metadata.version=getVersion()
  metadata.feature_annotation_attributes={
    accession:genAccession(metadata),
    name:genName(name,metadata),
    source:determineSource(metadata),
    type:"mature_miRNA",
    sequence_assembly_key:sequence_assembly[0],
    sequence_assembly_value:sequence_assembly[1]
  }
  metadata.mature_attributes={
    accession:genAccession(metadata),
    name:genName(name,metadata),
  }
  return metadata
}
function insertLine(line, index, metadata, ws) {
  metadata = buildAnnotationsForLine(line, index, metadata)

  function searchSequenceAnnotation(sequence_id, transaction) {
    let attributes = {
      tablename: "Mature_miRNA",
      where: {sequence_id},
      transaction
    }
    return transactionModels.getTableValuesWhere(attributes).then(model => {
      return extractPk(model)
    })
  }


  function getOrCreateSequence(metadata, transaction) {
    let sequence = metadata.sequence
    let err = function () {
      setCustomError("Sequence", metadata.sequence, metadata.lineNum, metadata.filename)
    }
    let where = {sequence}
    return createEntry("Mature_miRNA_sequence", {sequence}, transaction, err, where)
  }

  //NOT USED
  async function createMature(metadata, transaction) {
    let {sequence_id, mature_attributes} = metadata
    let err = function () {
      setCustomError("Mature_miRNA", metadata.sequence, metadata.lineNum, metadata.filename)
    }
    let tablename = 'Mature_miRNA'
    let insert_attributes = Object.assign({sequence_id}, mature_attributes)
    return await createEntry(tablename, insert_attributes, transaction, err)
  }

  function createAssayData(metadata, transaction) {
    let err = function () {
      setCustomError("AssayData", metadata.sequence, metadata.lineNum, metadata.filename)
    }
    let tablename = 'Assay_data'
    let insert_attributes = Object.assign({}, metadata.assayData_attributes)
    return createEntry(tablename, insert_attributes, transaction, err)
  }

  async function createFeature(metadata, sequence_id, transaction) {
    //Creates a
    metadata.sequence_id=sequence_id
    let err = function () {
      setCustomError("Annotation", metadata.sequence, metadata.lineNum, metadata.filename)
    }
    let tablename = 'Feature'
    let insert_attributes = Object.assign({}, metadata.feature_annotation_attributes)
    let accession = await createEntry(tablename, insert_attributes, transaction, err)
    if(accession==metadata.accession) {
      return accession
    }else{
      return err()
    }
  }

  function loadAssay_data(metadata, transaction) {

    ids = []
    metadata.rawCounts.forEach((raw, index) => {
      metadata.assayData_attributes = {assay: metadata.assay_ids[index], raw: raw.trim(),mature_miRNA: metadata.accession }
      ids.push(createAssayData(metadata, transaction).then(assay_data_id => {
        return assay_data_id

        /*let {mature_miRNA_id, date, version} = metadata
        metadata.annotation_attributes = {
          mature_miRNA_id,
          date,
          version,
          assay_data_id,
        }
        return createAnnotation(metadata, transaction).then(annotation_id => {
          return {annotation_id, assay_data_id}
        })*/
      }))
    })
    return Promise.all(ids)
  }

  function newFeatureAndSequence(metadata) {
    return db.sequelize.transaction().then(async function (transactionFeatureAndSequence) {
      try {
        let sequence_id = await getOrCreateSequence(metadata, transactionFeatureAndSequence)
        let accession = await createFeature(metadata, sequence_id, transactionFeatureAndSequence)
        if(accession instanceof Error) throw accession
        await transactionFeatureAndSequence.commit()
        return {sequence_id, accession}
      } catch (err) {
        await transactionFeatureAndSequence.rollback()
        return err
      }
    })
  }
  function newMatureAndAssayData(metadata){
    return db.sequelize.transaction().then(async (transactionMatureAndAssayData)=>{
      try{
        await createMature(metadata,transactionMatureAndAssayData)
        let assay_data=await loadAssay_data(metadata,transactionMatureAndAssayData)
        await transactionMatureAndAssayData.commit()
        let status = {
          name: "Success",
          message: `Line number: ${metadata.lineNum} inserted with success!`,
          created:{sequence_id:metadata.sequence_id,mature_id:metadata.accession,annotations:metadata.accession,assay_data}, //Can add more info AssayData
          referenced:{study_id:metadata.study_id, sequenceAssemblyComposite: metadata.sequenceAssemblyComposite},
        }
        return status;
      }catch (err) {
        await transactionMatureAndAssayData.rollback()
        return err
      }
    })
  }

    //TODO iterate over each line creating an assay_data and an annotation_attributes
    //Build these attribute objects
    //Depends on the creation of the Mature_miRNA
    //Requires a function that dos 

  async function newLine(metadata) {
    try {
      let results=await newFeatureAndSequence(metadata)
      if (results instanceof  Error) return results
      return await newMatureAndAssayData(metadata)
    }catch (e) {
      console.log("Failed to get a sequence_id and create a Feature")
      return e
    }
  }
  return newLine(metadata)
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
        let where=attributes
        assay_ids.push(createEntry(tablename,attributes,t,err,where))
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

function createEntry(tablename,insert_attributes,transaction,err,where){

  let attributes={
    tablename,
    inserts:insert_attributes,
    transaction
  }
  if(where){
    attributes.where=where
    return transactionModels.findOrCreateSingleTableDynamic(attributes).then(model=>{
      return extractPk(model,err)
    })
  }else{
    return transactionModels.saveSingleTableDynamic(attributes).then(model=>{
      return extractPk(model,err)
    })
  }

}




function setCustomError(name,element,file_line,input_file){
  let error=new Error(name)
  error.message=`${name} "${element}" not found! - Rollback has been triggered for this line`
  error.description={file_line,input_file}
  throw error
}
function extractPk(model,type,err){
  err = typeof type == "string" ? err : type 
  let pk=""
  try{

    if(model instanceof Array ){
      if (model.length == 0){
        return -1
      }else{
        pk=Object.entries(model[0].rawAttributes).filter(attr=> {
          return attr[1].primaryKey==true
        })
        return model[0].dataValues[pk[0][0]]
      }
    }else{
      pk=Object.entries(model.rawAttributes).filter(attr=> {
        return attr[1].primaryKey==true
      })
      return model.dataValues[pk[0][0]]
    }
  }
  catch(error){
    if(type=="try"){
      return id=-1
    }else{
      if(err) err() 
      new Error('Rollback triggered - Create failed! Or at least produced no pk')
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

