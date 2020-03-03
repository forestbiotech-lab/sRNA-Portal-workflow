/**
 * Created by Bruno Costa on 12-09-2017.
 */


//Calls Index to load sql tables
var db = require('./sqldb/index');

var e={}

e.getActiveProtocols=function(attributes){
  return db.Websockets_protocols
  .findAll({
    }).then(function(res){
    return res
  }).catch(function(err){
    console.log('getActiveProtocols - Err: '+err)
    return err
  })
}
module.exports = e

