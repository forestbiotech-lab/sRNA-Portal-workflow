/**
 * Created by Bruno Costa on 12-09-2017.
 */


//Calls Index to load sql tables
var db = require('./sqldb');

//getSequence search for the sequence in the database
function getSequence(attributes){
  return db.SRNA_sequence
  .findAll({
    include: [{
      model:db.Annotation,
      include:[{
        model:db.Provenance,
      },{
        model:db.Organism,
      }]
    }],
    where: attributes.where,
  })
  .then(function(res){
    return res;
  })
  .catch(function(err){
    console.log('getSequence - Err: '+ err);
    return err;
  });
}
//getSequence search for the sequence in the database
function getName(attributes){
  return db.Annotation
  .findAll({
    include:[{
        model:db.Provenance,
      },{
        model:db.SRNA_sequence,
      },{
        model:db.Organism,
    }],
    where: attributes.where,
  })
  .then(function(res){
    return res;
  })
  .catch(function(err){
    console.log('getSequence - Err: '+ err);
    return err;
  });
}




module.exports = {
  //Add all query functions for export below
  //name a function to run one of the functions above
    getName: getName,
    getSequence: getSequence,
}

