var model=require('./../../forms/models')
var db = require('./../sqldb/index');
const TABLE = "Profile"

function getProfiles(type){
  return new Promise((res,rej)=>{
    let where={type}
    let attributes={tablename:TABLE,where}
    model.getTableValuesWhere(attributes).then((result)=>{
      result instanceof Error ? rej(result) : res(result)
    })    
  })
}

function getProfile(type,profile){
  return new Promise((res,rej)=>{
    let where={type,profile}
    let attributes={tablename:TABLE,where}
    model.getTableValuesWhere(attributes).then((result)=>{
      if(result instanceof Error){ 
        rej(result)
      }else{
        parsedResult=[]
        result.forEach(row=>{
          parsedResult.push(row.dataValues)
        })
        res(parsedResult)        
      } 

    })

  })
}

function setProfile(type,profile,actions){
  //return new Promise((res,rej)=>{
  return db.sequelize.transaction(function(t){
    let updatePromises=update(actions.update,t)
    let profilePromises=create(updatePromises,type,profile,actions.create,t)
    profilePomises=destroy(updatePromises,actions.unset,t)
    return Promise.all(profilePromises)   
  })   ///Test roll-back on fail
}


function create(updatePromises,type,profile,rows,transaction){
  rows=rows || []
  profilePromises=updatePromises
  rows.forEach(row=>{
    let inserts=Object.assign({type,profile},rows[0])
    profilePromises.push(db[TABLE].create(inserts,{transaction}))
  })
  return profilePromises
}
function destroy(destroyPromises,rows,transaction){
  rows=rows || []
  rows.forEach(id=>{
    profilePromises.push(db[TABLE].destroy({where:id},{transaction}))
  })
  return profilePromises
}
function update(rows,transaction){
  let updates=[]
  rows.forEach(row=>{
    let where=row.where
    updates.push(db[TABLE].update(row.inserts,{where},{transaction}))
  })
  return updates
}




module.exports={setProfile,getProfile}