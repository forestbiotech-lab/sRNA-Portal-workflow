const crypto=require('crypto')


module.exports={genHash}

function genHash(){
  let rand=(Math.random()*10000).toString()
  let hash=crypto.createHash('sha256')
  hash.update(rand)
  return hash.digest('hex')
}