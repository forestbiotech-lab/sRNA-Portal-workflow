var express = require('express');
var router = express.Router();
var docker=require('.././components/docker/bioconductor')
var wsClient=require('.././components/websockets/wsClient').Client


    

router.get('/run/de', async function(req, res, next) {
  let ws=new wsClient()
  let protocolType="docker"
  ws.connect(protocolType,res)
  await ws.isConnected()
  docker(ws).then(data=>{
    //ws.close()
  },rej=>{
    ws.sendMSG('something went wrong!: '+rej)
    //ws.close()
  })
});


module.exports = router;
