/**
 * Created by Bruno Costa on 12-09-2017.
 */


//Calls Index to load sql tables
var db = require('./sqldb/index');

var e={}

//getSequence search for the sequence in the database
e.sequenceSearch=function(attributes){
  return db.Mature_miRNA
  .findAndCountAll({
    include: [{
      model:db.Feature,
      include: [{
        model: db.Genome,
        include: [{
          model: db.Organism
        }]
      }]
    },{
      model: db.Mature_miRNA_sequence,
      where: attributes.where
    }],
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
      model:db.Feature,
      include: [{
        model: db.Genome,
        include: [{
          model: db.Organism
        }]
      }]
    }],
    where: attributes.where,
  })
  .then(function(res){
    return res;
  })
  .catch(function(err){
    console.log('getSequence by Name - Err: '+ err);
    return err;
  });
}

e.getFeatures=function(attributes){
  return db.Mature_miRNA
  .findAndCountAll({
    include:[{
      model: db.Mature_has_Pre,
      include:[{
        model:db.Pre_miRNA,
        include:[{
          model:db.Pre_miRNA_sequence
        },{
          model:db.Feature
        }]
      }]
    },{
      model:db.Feature
    }],
    where: attributes.where
  }).then(function(res){
    return res;
  })
  .catch(function(err){
    console.log('getFeatures - Err:'+ err);
    return err
  })
}

e.linkedMatureMiRNA=function(attributes){
  return db.Pre_miRNA
  .findAndCountAll({
    include: [{
      model: db.Mature_has_Pre,
      include:[{
         model: db.Mature_miRNA
      }] 
    }],
    where: attributes.where
  }).then(function(res){
    return res;
  })
  .catch(function(err){
    console.log('getFeatures - Err:'+ err);
    return err
  })
}

e.statsOrganism=function(attributes){
  return db.Organism
  .findAndCountAll({
  }).then(function(res){
    return res;
  }).catch(function(err){
    console.log('getGlobal Stats - Err:'+err)
    return err
  })
}

e.saveSequence=function(attributes){
  return db.Mature_miRNA_sequence
  .create(
      attributes.insert
    ).then(function(res){
    console.log(res)
    return res
  }).catch(function(err){
    console.log('saveSequence - Err:'+err)
    return err
  })
}
e.getSequenceIdBySequence=function(attributes){
  return db.Mature_miRNA_sequence
  .findOne({
      where:attributes.where
    }).then(function(res){
    return res
  }).catch(function(err){
    console.log('getSequenceIdBySequence - Err: '+err)
    return err
  })
}

e.countAssayDataInStudy=function(attributes){
  return db.Assay_data
  .count({
    include:[{
      model:db.Assay,
      where: { study : attributes.where.studyId } 
    }]    
  }).then( res => {
    return res
  }).catch( err => {
    console.log('countAssayDataInStudy - Err: '+err)
    return err
  })
}

//TODO switch
e.getAssayDataWithAnnotations=(attributes)=>{
  return db.Assay_data
  .findAndCountAll({
    limit: 5000,
    order:[[
      db.Assay_data.associations.Mature_miRNA,
      'name', 
      'ASC'
    ]], //203616
    include:[{
      model:db.Assay,
      where: attributes.where    
    },{
      model:db.Mature_miRNA,
      include:[{
        model:db.Mature_miRNA_sequence,
      }]
    }]
  }).then( res => {
    return res
  }).catch( err => {
    console.log('getAssayDataWithAnnotations - Err: '+err)
    return err
  })
}

e.getTargetsInfoOnSequence=(attributes)=>{
  return db.Target
  .findAndCountAll({
    include:[{
      model:db.Transcript
    },{
      model:db.Mature_miRNA,
      include:[{
        model:db.Mature_miRNA_sequence,
        where:attributes.where.Mature_miRNA_sequence
      }]
    }],
    where:attributes.where.Target
  }).then(res=>{
    return res
  }).catch( err => {
    console.log('getTargetsInfoOnSequence - Err: '+err)
    return err
  })
}
module.exports = e

