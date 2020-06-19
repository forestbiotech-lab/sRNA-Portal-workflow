var assembleAssayData=require('./../../miRNADB/assembleAssayData')


module.exports={
  rawReadsFile
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
  let temp=["seq"]
  headers.forEach(header=>{
    temp.push(header)
  })
  return temp.reduce((ac,cur)=>{return ac+"\t"+cur})
}

function makeBody(headers,data,result){
  Object.keys(data.rows).forEach(seq=>{
    let temp=[]
    temp.push(seq)
    var raw=data.rows[seq].raw
    headers.forEach(header=>{
      temp.push(raw[header].value)
    })
    result+="\n"+temp.reduce((ac,cur)=>{return ac+"\t"+cur})
  })
  return result
}