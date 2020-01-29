//Process data to insert into database
var db = require('./../sqldb/index');
const fs = require('fs')
const MINSIZE=2
const PREVIEW_LINES=10

module.exports={getPreview}




function getPreview(targetsFile){
	fs.readFile(targetsFile,'utf8', (err, data) => {
  		if (err) throw err;
  		//console.log(data);
  		let lines=data.split("\n")
  		lines.forEach((line)=>{
  		    line=line.split("\t")
  		    if(line.length>MINSIZE) insertLine(line)
  		})
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


function insertLine(line){

	return db.sequelize.transaction(function (t) {
	  // chain all your queries here. make sure you return them.
	  //miRNA_Acc.	Target_Acc.	Expectation	UPE	miRNA_start	miRNA_end	Target_start	Target_end	miRNA_aligned_fragment	Target_aligned_fragment	Inhibition	Target_Desc.
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
	  });
	}).then(function (result) {
		result
	  // Transaction has been committed
	  // result is whatever the result of the promise chain returned to the transaction callback
	}).catch(function (err) {
	    err
	  // Transaction has been rolled back
	  // err is whatever rejected the promise chain returned to the transaction callback
	});



}