//Process data to insert into database
var db = require('./../sqldb/index');
const fs = require('fs')
const minsize=2
module.exports=function(targetsFile){
	fs.readFile(targetsFile,'utf8', (err, data) => {
  		if (err) throw err;
  		//console.log(data);
  		let lines=data.split("\n")
  		lines.forEach((line)=>{
  		    line=line.split("\t")
  		    if(line.length>minsize) insertLine(line)
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
//		return user.setShooter({
//		  firstName: 'John',
//		  lastName: 'Boothe'
//		}, {transaction: t});
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