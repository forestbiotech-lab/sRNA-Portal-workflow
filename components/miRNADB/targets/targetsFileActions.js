//Process data to insert into database
var db = require('./../sqldb/index');
var transactionModels=require('./../transactions/models')

const fs = require('fs')
const MINSIZE=2
const PREVIEW_LINES=10
const MAX_TRANSACTIONS=2
var TARGETS;
module.exports={getPreview,loadTargets}



function loadTargets(targetsFile,genome_id,study_id,transcript_xref,ws){
  return new Promise((res,rej)=>{  
    fs.readFile(targetsFile,'utf8', (err, data) => {
      if (err) rej(err);
      //console.log(data);
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


function insertControl(fieldOfPromises,results,lines,targetsFile,genome_id,study_id,transcript_xref, index, date,ws){
  while(fieldOfPromises.length<MAX_TRANSACTIONS && lines.length >0){
    line=lines.pop()
    line=line.split("\t")
    if(line.length>MINSIZE) fieldOfPromises.push(insertLine(targetsFile,line,genome_id,study_id,transcript_xref, index, date))
    index--
    ws.sendMsg(JSON.stringify({msg:{percentageComplete:(100*(TARGETS-index)/TARGETS)}}))
  }
  if(fieldOfPromises.length>0){
    return Promise.all(fieldOfPromises).then(transactions=>{
      results.push(transactions)
      fieldOfPromises=[]
      console.log(index)
      return insertControl(fieldOfPromises, results, lines, targetsFile, genome_id, study_id,transcript_xref, index,date,ws)
    })
  }else{
    return results.flat() 
  }
}


function insertLine(filename,line,genome_id,study_id,transcript_xref, index,date){
  feature_attributes={
    name:line[1],
    source:'psRNAtarget',
    type:'miRNA_target',
    start:line[6],
    end:line[7],
    strand:'+'
  }
  transcript_attributes={
    accession:line[1],
    xref:transcript_xref,
    version:1
  }
  sequence=line[8].replace(/[^ATGCU]*/g,"")
  target_attributes={
    study_id,
    date,
    type:line[10],
    target_description:line[12].trim(),
    expectation:line[2],
    UPE:line[3],
  }
  lineNum=index

  return db.sequelize.transaction().then(function(t){
	// chain all your queries here. make sure you return them.
	//miRNA_Acc.	Target_Acc.	Expectation	UPE	miRNA_start	miRNA_end	Target_start	Target_end	miRNA_aligned_fragment	Target_aligned_fragment	Inhibition	Target_Desc.

    
    function searchSequenceId(sequence,transaction){
      let attributes={
        tablename:"Mature_miRNA_sequence",
        where:{sequence},
        transaction
      }
      return transactionModels.getTableValuesWhere(attributes).then(model=>{
        return extractId(model,attributes.tablename)
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


    function getMiRNAannotation(sequence,transaction){
      return searchSequenceId(sequence, transaction).then(sequence_id=>{
        if( sequence_id > -1){
          return searchSequenceAnnotation(sequence_id, transaction)
        }else{
          return -1
        }
      })
    }

    function createFeature(genome_id,feature_attributes,transaction){
      let attributes={
        tablename:"Feature",
        inserts:Object.assign({genome_id}, feature_attributes),
        transaction
      }
      return transactionModels.saveSingleTableDynamic(attributes).then(model=>{
        return extractId(model)
      }).catch(function(error){
        console.log(error)
      })
    }
    function createTranscript(feature_id,transcript_attributes,transaction){
      let attributes={
        tablename:"Transcript",
        inserts:Object.assign({feature_id},transcript_attributes),
        transaction
      }
      return transactionModels.saveSingleTableDynamic(attributes).then(model=>{
        return extractId(model)
      }).catch(function(err){
        console.log(err)
      })      
    }

    function newTarget(lineNum,sequence,genome_id,feature_attributes,transcript_attributes,target_attributes,transaction){
      return createFeature(genome_id,feature_attributes,transaction).then(feature_id=>{
        return createTranscript(feature_id, transcript_attributes, transaction).then(transcript_id=>{
          return getMiRNAannotation(sequence, transaction).then(mature_miRNA_id=>{
            return createTarget(mature_miRNA_id, transcript_id, target_attributes, transaction).then(target_id=>{
              return {lineNum,created:{target_id,feature_id,transcript_id},referenced:{mature_miRNA_id}}
            })
          })
        })
      })      
    }

    function createTarget(mature_miRNA_id,transcript_id,target_attributes,transaction){
      let attributes={
        tablename:"Target",
        inserts: Object.assign({
          transcript_id,
          version:determineVersion(),
          mature_miRNA_id
        },target_attributes),
        transaction
      }
      return transactionModels.saveSingleTableDynamic(attributes).then(model=>{
        return extractId(model)
      })
    }

    function determineVersion(){
      return 1
    }

    function extractId(model,tablename){
      id=""
      if(model instanceof Array ){
        if (model.length == 0){
          if(tablename=="Mature_miRNA_sequence"){
            let sequence_error=new Error(`Sequence "${sequence}" not found! - Rollback has been triggered for this line`)
            sequence_error.description={target_line:lineNum,target_file:filename}
            throw sequence_error 
          }else{
            id=-1
          }
        }else{
          id=model[0].dataValues.id
        }
      }else{
      	id=model.dataValues.id || new Error('Rollback triggered - Create failed! Or at least produced no id')
      }
      return id
    }



    return newTarget(lineNum, sequence, genome_id, feature_attributes, transcript_attributes, target_attributes, t).then(function(targetCreation){
      return t.commit().then(()=>{
        let status={
          name:"Success",
          message:`Line number: ${targetCreation.lineNum} inserted with success!`,
          created:targetCreation.created,
          referenced:targetCreation.referenced
        }
        return status;
      })
    }).catch(function (err) {
      return t.rollback().then(a=>{
        return err
      })
    });
  })
}



function getPreview(targetsFile,iteration){
  return new Promise((res,rej)=>{
    var rs = fs.createReadStream(targetsFile, {encoding: 'utf8'});
    var acc = '';
    var pos = 0;
    let savedLines=0
    var index = 0;

    rs.on('data', function (chunk) {
      matches = chunk.match(/\n/g);
      acc += chunk;
      lines=matches.length

      if(lines>=PREVIEW_LINES){
        rs.close()
        if(matches.length>1){
          var lastLines=PREVIEW_LINES-savedLines
          let i=0;
          while (i<lastLines){
            index=chunk.indexOf("\n",index)+1
            i+=1
          }
        }else{
          index=chunk.indexOf('\n')
        }
      }else{
        pos+=chunk.length;
        savedLines+=lines
      }
    }).on('close', function () {
      res(acc.slice(0, pos + index).split('\n'));
    }).on('error', function (err) {
      rej(err);
    })
  })
}