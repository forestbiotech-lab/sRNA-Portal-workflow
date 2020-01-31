//Process data to insert into database
var db = require('./../sqldb/index');
var transactionModels=require('./../transactions/models')

const fs = require('fs')

const MINSIZE=2
const PREVIEW_LINES=10

module.exports={getPreview,loadTargets}




function loadTargets(targetsFile,genome_id,assay_ids){
  return new Promise((res,rej)=>{  
    fs.readFile(targetsFile,'utf8', (err, data) => {
      if (err) rej(err);
      //console.log(data);
      let lines=data.split("\n")
      let fieldOfPromises=[]
      lines.forEach((line)=>{
        line=line.split("\t")
        if(line.length>MINSIZE) fieldOfPromises.push(insertLine(line,genome_id))
    	})
      res(fieldOfPromises)
  	}) 
  })
}

function insertLine(line,genome_id,assay_ids){

	return db.sequelize.transaction(function (t) {
	  // chain all your queries here. make sure you return them.
	  //miRNA_Acc.	Target_Acc.	Expectation	UPE	miRNA_start	miRNA_end	Target_start	Target_end	miRNA_aligned_fragment	Target_aligned_fragment	Inhibition	Target_Desc.

    //find sequence
    sequence=line[0].split('-')[0]

    function searchSequenceId(sequence,transaction){
      attributes={
        tablename:"Mature_miRNA_sequence",
        where:{sequence},
        transaction
      }
      return transactionModels.getTableValuesWhere(attributes).then(model=>{
        return extractId(model)
      })      
    } 


    function searchSequenceAnnotation(sequence_id,transaction){
      attributes={
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
      attributes={
        tablename:"Feature",
        inserts:Object.assign({genome_id}, feature_attributes),
        transaction
      }
      return transactionModels.saveSingleTableDynamic(attributes).then(model=>{
        return extractId(model)
      })


    }


    function createTarget(sequence_id,assay_id,genome_id,feature_attributes,transaction){
      return createFeature(genome_id,feature_attributes,transaction).then(feature_id=>{
        if( feature_id >-1){
          let version=1
          let accession=feature_attributes.name
          return createTranscript(feature_id, version, accession, transaction)
        }else{
          return Error("Unable to create Feature for target!")
        }
      })

    }


    function createTranscript(feature_id,version,accession,transaction){
      attibutes={
        tablename:"Transcript",
        inserts:{feature_id,version,accession},
        transaction
      }
      return transactionModels.saveSingleTableDynamic(attributes).then(model=>{
        return extractId(model)
      })      
    }

    function extractId(model){
      id=""
      if(model instanceof Array ){
        id=model[0].dataValues.id || -1
      }else{
      	id=model.dataValues.id || Error('Roll back create failed! Or at least produced no id')
      }
      return id
    }


    feature_attributes={
      name:line[1],
      source:'psRNAtarget',
      type:'miRNA_target',
      start:line[6],
      end:line[7]
    }
    //return getMiRNAannotation(sequence, t)

  return createTarget(1, 1, genome_id, feature_attributes, t)
  //Data for Table Target 

/*
	  return db.Feature.create({
	  	genome_id:3,
      name: line[1],
      source: "psRNAtarget",
      type: "targetPrediction",
      start:line[4],
      end:line[5],
	  }, {transaction: t}).then(function (feature) {
        let featureId=feature.dataValues.id
        let miRNA_sequence=line[0].split("-")[0]
        return db.Mature_miRNA_sequence.findOne({
        	where:{sequence:miRNA_sequence}
        },{transaction:t}).then(function(sequence){
        	sequence=sequence
        	throw "lklk"
        })
	  });*/
	}).then(function (result) {
     //throw Error('This can\'t be allowed to continue!') 
	 return result
	  // Transaction has been committed
	  // result is whatever the result of the promise chain returned to the transaction callback
	}).catch(function (err) {
	 return err
	  // Transaction has been rolled back
	  // err is whatever rejected the promise chain returned to the transaction callback
	});
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