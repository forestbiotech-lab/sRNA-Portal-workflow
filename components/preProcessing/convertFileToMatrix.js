const fs = require('fs')
var md5 = require('md5');


module.exports=function(filePath){
  return new Promise(function(res,rej){
    let matrix={header:[],seqLookup:{},hashLookup:{},duplicateHashes:[],duplicateSeq:[]}
    let sequences=[]
    let rowsHashes=[]
    fs.readFile(filePath,'utf8', function(err,data){
      //Calculate hash for each line
      if (err) rej(err)

      let rows=data.toString().split(/\r*\n/) 
      rows.forEach(function(row,index){
        row=row.split("\t")  
        if(index==0){
          matrix.header=row
          
        }else{
          if(row.length>0){
            let seq=row[0]
            let hash=hashRow(row)
            sequences.push(seq)
            rowsHashes.push(hash)
            matrix.seqLookup[seq] ? matrix.seqLookup[seq].push(row) : matrix.seqLookup[seq]=[row] 
            matrix.hashLookup[hash] ? matrix.hashLookup[hash].push(row) : matrix.hashLookup[hash]=[row] 
          }          
        }
      })
      matrix.duplicateHashes=getDuplicates(rowsHashes)
      matrix.duplicateSeq=getDuplicates(sequences)
      res(matrix)
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