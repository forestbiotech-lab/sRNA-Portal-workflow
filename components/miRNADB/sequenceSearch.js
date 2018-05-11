/**
 * Created by Bruno Costa on 20-09-2017.
 */


var models= require('./models');





module.exports = function(query,options){
  var options = options || {};
  //problem if where doesn't exist req allways has query right?
  query.where={}
  if(typeof query.searchText == "string"){
  	query.where.sequence=query.searchText;
  }
  
  //runs a model function with options.
  //return models.[a function name](options); 
  return new Promise(function(resolve,reject){
  	models.getSequence(query).then(function(res){
  		console.log(query.where);
  		if(res instanceof Error){
  			//What is the correct code to send?
  			reject({err:res,metadata:{status:[{code:'500'}]}});
  		}else{
  			var databaseValues=[]

        //Go trough lines
  			for (row in res){

          //This stores the values for each line
          var databaseLine={}
          var level1keys=Object.keys(res[row].dataValues);
  			  for( lv1keyIndex in level1keys ){
            try{
              var level2keys=Object.keys(res[row].dataValues[level1keys[lv1keyIndex]].dataValues);
              for( lv2keyIndex in level2keys ){
                try{
                  var level3keys=Object.keys(res[row].dataValues[level1keys[lv1keyIndex]].dataValues[level2keys[lv2keyIndex]].dataValues);
                  for( lv3keyIndex in level3keys){
                    try{
      
                      console.log( Object.keys(res[row].dataValues[level1keys[lv1keyIndex]].dataValues[level2keys[lv2keyIndex]].dataValues[level3keys[lv3keyIndex]].dataValues) )

                    }catch(err3){
                      databaseLine[level2keys[lv2keyIndex]+'_'+level3keys[lv3keyIndex]]=res[row].dataValues[level1keys[lv1keyIndex]].dataValues[level2keys[lv2keyIndex]].dataValues[level3keys[lv3keyIndex]]    

                    }}
                }
                catch(err2){
                  //Fall back Send objects that aren't multilevelled to databaseLine
                  databaseLine[level1keys[lv1keyIndex]+'_'+level2keys[lv2keyIndex]]=res[row].dataValues[level1keys[lv1keyIndex]].dataValues[level2keys[lv2keyIndex]]    
                }
              }
            }catch(err1){
              //Fall back
              databaseLine[res[0].$modelOptions.tableName+"_"+level1keys[lv1keyIndex]]=res[row].dataValues[level1keys[lv1keyIndex]]
            }
          }
          databaseValues.push(databaseLine);
        }
  			resolve(databaseValues);
  		}
  	})
  })
}

