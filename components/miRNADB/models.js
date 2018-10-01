/**
 * Created by Bruno Costa on 12-09-2017.
 */


//Calls Index to load sql tables
var db = require('./sqldb/index');

//getSequence search for the sequence in the database
function sequenceSearch(attributes){
  console.log(attributes);
  return db.Mature_miRNA
  .findAndCountAll({
    include: [{
      model: db.Pre_miRNA,
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
function nameSearch(attributes){
  return db.Mature_miRNA
  .findAndCountAll({
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
    nameSearch: nameSearch,
    sequenceSearch: sequenceSearch,
}

