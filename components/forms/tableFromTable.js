var models=require('./models')
var call="formSelect"


module.exports=function(options){
  return new Promise(function(res,rej){
    models[call](options).then(function(data){
      if(data instanceof Error ) rej(data)
      let attributes=options.attributes || []
      let result=[] 
      data.forEach(function(row,index){
        let entry={}
        if(attributes.length==0){
          Object.keys(row.dataValues).forEach(attr=>{
            entry[attr]=row.dataValues[attr]
          })
        }else{
          attributes.forEach(function(attr){
            entry[attr]=row.dataValues[attr]
          })
        }
        result.push(entry)
      })
      res(result)
    }).catch(function(err){
      rej(err)
    })
  })

}