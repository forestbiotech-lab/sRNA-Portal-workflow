const fs = require('fs')
var md5 = require('md5');


module.exports=function(filePath){
  return new Promise(function(res,rej){
    let matrix={header:[],seqLookup:{},hashLookup:{},duplicateHashes:[],duplicateSeq:[]}
    let sequences=[]
    let rowsHashes=[]
    fs.readFile(filePath,'utf8', function(err,data){
      //Calculate hash for each line
      if (err){
        rej(err)
      }else{
        let rows=data.toString().split(/\r*\n/) 
        let fileColumnWidth
        rows.forEach(function(row,index){
          row=row.split("\t")  
          if(index==0){
            matrix.header=row
            fileColumnWidth=matrix.header.length
            if(fileColumnWidth<3){
              let err=new Error(`The file doesn't have the proper structure number of columns is less then 3`)
              err.name="InvalidStructure"
              err.type="QualityControl"
              err.msg=err.message
              rej(err)
            } 
          }else{
            let rowLength=row.length
            if(rowLength>0 && rowLength==fileColumnWidth){
              let seq=row[0]
              let hash=hashRow(row)
              sequences.push(seq)
              rowsHashes.push(hash)
              matrix.seqLookup[seq] ? matrix.seqLookup[seq].push(row) : matrix.seqLookup[seq]=[row] 
              matrix.hashLookup[hash] ? matrix.hashLookup[hash].push(row) : matrix.hashLookup[hash]=[row] 
            }else{
              let err=new Error(`The row line:${index+1} has an invalid number of columns`)
              err.name="InvalidStructure"
              err.type="QualityControl"
              err.msg=err.message
              rej(err)
            }          
          }
        })
        matrix.duplicateHashes=getDuplicates(rowsHashes)
        matrix.duplicateSeq=getDuplicates(sequences)
        res(matrix)
      }
    })
  })
}

function hashRow(row){
  if( typeof row == "string" ) return md5(row)
  const reducer=(accumulator,currentValue) => accumulator+currentValue;
  return md5(row.reduce(reducer))
}
function getDuplicates(array){
  let uniq = array.map((seq) => {
      return {
        count: 1,
        name: seq
      }
    })
    .reduce((a, b) => {
      a[b.name] = (a[b.name] || 0) + b.count
      return a
    }, {})
  return Object.keys(uniq).filter((a) => uniq[a] > 1)
}