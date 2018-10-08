/**
 * Created by Bruno Costa on 12-09-2017.
 */


//Calls Index to load sql tables
var db = require('./sqldb/index');

var e={}

//getSequence search for the sequence in the database
e.sequenceSearch=function(attributes){
  console.log(attributes);
  return db.Mature_miRNA
  .findAndCountAll({
    include: [{
      model: db.Pre_miRNA,
      include: [{
        model:db.Feature,
        include: [{
          model: db.Genome,
          include: [{
            model: db.Organism
          }]
        }]
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
e.nameSearch=function(attributes){
  return db.Mature_miRNA
  .findAndCountAll({
    include: [{
      model: db.Pre_miRNA,
      include: [{
        model:db.Feature,
        include: [{
          model: db.Genome,
          include: [{
            model: db.Organism
          }]
        }]
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

e.getFeatures=function(attributes){
  return db.Pre_miRNA
  .findAndCountAll({
    include: [{
      model: db.Mature_miRNA,
    },{
      model: db.Feature
    }],
    where: attributes.where
  }).then(function(res){
    return res;
  })
  .catch(function(err){
    console.log('getFeatures - Err:'+ err);
  })
}


module.exports = e

