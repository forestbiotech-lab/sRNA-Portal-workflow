var assembleAssayData=require('./assembleAssayData')
var assay=require('./queryModels/assay')


module.exports={
  rawReadsFile,
  assayOutputsFile,
  studyDesignFile
}

function rawReadsFile(opt){
  return assembleAssayData(opt).then(data=>{
    
    let headers=[]
    data.header.raw.forEach(raw=>{
      headers.push(raw.value.replace("\t","_"))
    })
    let result=makeHeader(headers)
    return makeBody(headers,data,result)
  })
}

function makeHeader(headers){
  let temp=['name']
  headers.forEach(header=>{
    temp.push(header)
  })
  return temp.reduce((ac,cur)=>{return ac+"\t"+cur})+"\n"
}

function makeBody(headers,data,result){
  Object.keys(data.rows).forEach(seq=>{
    let temp=[]
    temp.push(seq)
    temp.push(data.rows[seq].row_attributes.Name.value)
    var raw=data.rows[seq].raw
    headers.forEach(header=>{
      temp.push(raw[header].value)
    })
    result+=temp.reduce((ac,cur)=>{return ac+"\t"+cur})+"\n"
  })
  return result
}
function assayOutputsFile(opt){
  let study_id=opt.params.study
  return assay.index(study_id).then(function(data){
    if(data instanceof Error) return data
    let headers=[]
    let outputs=[]
    data.data.forEach(datum=>{
      headers.push(datum.name)
      outputs.push(datum.output)
    })
    let result=headers.reduce((ac,cur)=>{return ac+"\t"+cur})+"\n"
    result+=outputs.reduce((ac,cur)=>{return ac+"\t"+cur})+"\n"
    return result  
  },rej=>{
    return rej
  })
}
function studyDesignFile(opt){
  let study_id=opt.params.study
  return assay.index(study_id).then(function(data){
    if(data instanceof Error) return data
    
    let headers=["factor","type"]
    let factores={}
    let modalities={}
    buildVars(data,headers,factores,modalities)
    loadVars(data,factores,modalities)
    //({a,b,c}={a:21,b:22,c:11})  
    //a+=1  
    //({headers,factores,modalities}=temp)
    //({factores,modalities}=))
    let result=headers.reduce((ac,cur)=>{return ac+"\t"+cur})+"\n"
    result+=generateLines(factores)
    result+=generateLines(modalities)

    
    function buildVars(data,headers,factores,modalities){
      data.data.forEach(datum=>{
        headers.push(datum.name)
        if(datum.factor!=null) factores[datum.factor]=[datum.factor,datum.factor,"Factor"]
        if(datum.modality!=null) modalities[datum.modality]=[datum.modality,datum.factor,"Modality"]
      })
      return {headers,factores,modalities}
    }
    function loadVars(data,factores,modalities){
      data.data.forEach(datum=>{
        Object.keys(factores).forEach(factor=>{
          factores[factor].push((factor==datum.factor?1:0))
        })
        Object.keys(modalities).forEach(modality=>{
          modalities[modality].push((modality==datum.modality?1:0))
        })
      })
      return {factores,modalities}
    }
    function generateLines(lineHolder){
      result=""
      Object.keys(lineHolder).forEach(line=>{
        result+=lineHolder[line].reduce((ac,cur)=>{return ac+"\t"+cur})+"\n"
      })
      return result
    }
    
    return result  
  },rej=>{
    return rej
  })  
}