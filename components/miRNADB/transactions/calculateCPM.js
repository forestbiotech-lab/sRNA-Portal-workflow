
var db = require('./../sqldb/index');
var transactionModels=require('./../transactions/models')
const Op = db.sequelize.Op;

//OUTPUTS
const queryTable="Assay_data"
const queryTableFK="assay"
const MAX_TRANSACTIONS=1
const RETRIES=3
module.exports={main}

async function main(assayIds,ws){
    //Static
    
    let result={successes:[],failures:[],errors:[]}
    assayPromisses=[]
    //------
    let outputs=await getOutputs(assayIds)
    assayIds.forEach(async function(assayId){
      assayPromisses.push(new Promise(async (res,rej)=>{
        let output=outputs[assayId]
        if(output>0){
          let assayData
          try{
            assayData=await getAssayData(assayId)
          }catch(error){
            res({failures:["Unknown error while getting assaydata:"+JSON.stringify(error),error]})
          }
          if(assayData.length>0 && assayData instanceof Array){
            //assayData=assayData.splice(0,4)
            ws.sendMsg(JSON.stringify({assayId,size:assayData.length}))
            let successes=[]
            let failures=[]
            res(process(assayData,output,successes,failures,ws))
          }else{
             res({failures:['No assayData found for assay id:'+assayId]})
          }
        }else{
          res({failures:['No output for array id:'+assayId]})
        }
      }))
    })  
    return Promise.all(assayPromisses).then(assayResults=>{
      let response={}
      assayResults.forEach((assayResult,index)=>{
        response[assayIds[index]]=assayResult
      })
      ws.sendMsg(JSON.stringify(response))
      return response  
    },rejection=>{
      return rejection 
    }).catch(error=>{
      return error
    })
}


function extend(dest, source) {
    if( dest instanceof Array && source instanceof Array ){
        source.forEach(elm=>{
          dest.push(elm)
        })
    }else{
      for (var prop in source) {
          dest[prop] = source[prop];
      }
    }
};


async function process(models,output,successes,failures,ws){ 
      let updateBundle=[]
      let transaction=0
      let backupModels=[]
      while(transaction<MAX_TRANSACTIONS && models.length>0){
          let model=models.pop()
          backupModels.push(model)
          updateBundle.push(updateModel(model,output))
          transaction++
      }
      try{
        let updates=await executeUpdateBundle(updateBundle)
        if(updates.errors.length>0){
          if(updates.success.length>0){
            extend(successes,updates.success)
          }
          updates=await retryTransactionBundle(backupModels,output,updates.errors)
          if(updates.errors.length>0){
            extend(failures,updates.errors)
          }
          if(updates.success.length>0){
            extend(successes,updates.success)
          }
        }else{
          if(updates.success.length>0){
            extend(successes,updates.success)
          }
          if(updates.rejection){
            let error= new Error("Rejection")
            error.errors=[]
            backupModels.forEach(model=>{
              error.errors.push({description:"Rejection retry all!",modelId:model.id})  
            })
            throw error 
          } 
        }
      }catch(error){
          try{
            let updates=await retryTransactionBundle(backupModels,output,error.errors)  
            //remove?
            if(updates.rejection){
              extend(failures,backupModels)
            }
            if(updates.success.length>0){
              extend(successes,updates.success)
            }             
          }catch(error){
            if(error.rejection){
              extend(failures,error.rejection)
            }
            if(error.errors.length>0){
              extend(failures,error.errors)
            }
            if(error.success.length>0){
              extend(successes,error.success)
            } 
          }
      }
      
      if(models.length>0){
        ws.sendMsg(JSON.stringify({assayId:models[0].dataValues.assay,successes}))  
        return process(models,output,successes,failures,ws)
      }else{ 
        return {successes,failures}
      }
}

async function retryTransactionBundle(backupModels,output,errors){
  retry=0
  let result={success:[],errors:[]}
  
  
  function reconstructTransactionBundle(backupModels,output,errors){
    let transactionBundle=[]
    errors.forEach(error=>{
      let id=error.modelId
      backupModels.forEach(model=>{
        if(model.dataValues.id==id){
          transactionBundle.push(updateModel(model,output))
        }
      })
    })
    return transactionBundle
  } 
  while(retry<RETRIES){
    let transactionBundle=reconstructTransactionBundle(backupModels,output,errors)
    let preliminaryResult=await executeUpdateBundle(transactionBundle)
    if(preliminaryResult.success.length>0){
      extend(result.success,preliminaryResult.success)
      if(preliminaryResult.errors.length==0)
        retry=RETRIES
    }
    retry++  
  }
  return result
  
}

function executeUpdateBundle(updateBundle){
  let success=[]
  let errors=[]
  return Promise.all(updateBundle).then(results=>{
      results.forEach(result=>{
        if(result instanceof Error){
          errors.push(result)
        }else{
          success.push(result)
        }
      })
      return {success,errors}
    },rejection=>{
      return {rejection,success,errors}
  })
}

function getAssayData(assayId){
  let where={}
  where[queryTableFK]=assayId
  return db[queryTable].findAll({where}).then(models=>{
    return models
  })
}
function getOutputs(assayIds){
  let where={id:{[Op.in]:assayIds}}
  return db['Assay'].findAll({where}).then(models=>{
    outputs={}
    models.forEach(model=>{
      outputs[model.id]=model.output
    })
    return outputs
  },rejection=>{
    return rejection
  }).catch(err=>{
  	return err
  })
}
function updateModel(model,output){
  if(model){
    if(model.dataValues){
      if(model.dataValues.id){
        let where={id:model.id}
        let cpm=parseInt(model.raw)*parseInt(output)/1000000
        let attributes={cpm,where:{id:model.id}}
        return new Promise((res,rej)=>{
          return db.sequelize.transaction().then(function(t){	
            db[queryTable].update(attributes,{where},{transaction:t}).then(update=>{
              t.commit().then(()=>{
                res({id:model.id,update})
              })
            },rejection=>{
              t.rollback().then(()=>{
                res(setCustomError(name="Rejection",model.assay,model_id=model.id,description="Updating model was rejected: "+rejection))
              })
            }).catch(err=>{
              t.rollback().then(()=>{
                rej(setCustomError(name="Error",model.assay,model_id=model.id,description="Updating model threw an error: "+err))
              })      
            })
          })
        })
      }else{
        return setCustomError(name="NoModelId",model.assay,model_id=model.id,description="Unable to update this model no id")
        return new Error('Unable to update this model')
      }
    }else{
      return setCustomError(name="NoDataValues",model.assay,model_id=model.id,description="Problem getting dataValues from model!")
      return new Error('Unable to update this model')
    }
  }else{
    return setCustomError(name="NoModel",null,model_id=undefined,description="Model not found")
    return new Error('Unable to update this model')
  }
}




function setCustomError(name,assay_id,model_id,description){
  let error=new Error(`${name} "${model_id}" not found for ${assay_id}! - Rollback has been triggered for this line`)
  error.description={model_id,description}
  error.modelId=model_id
  return error
}

function updateTransactionsStatus(transactions){
  transactions.forEach(transaction=>{
    if(transaction.name=="Success"){
      successes++
    }else{
      errors++
    }
  })
}

