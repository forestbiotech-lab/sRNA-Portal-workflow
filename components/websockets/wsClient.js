var WebSocketClient = require('websocket').client;
var models=require('./../forms/models')
var fs = require('fs')
var utils=require('./../miRNADB/helpers/utils')
const PORT= require('./../../.config_res').websocket.port
const DOMAIN = require('./../../.config_res').host.domain
const HOST= process.env.mode=="PRODUCTION" ? DOMAIN : "localhost";
class Client{
    constructor(){
        let client = new WebSocketClient();
 
        this.extraRequestOptions={}
        this.origin={}
        this.options={}
        let _this=this
        this.utils=utils
        if(process.env.mode=="PRODUCTION"){
          this.extraRequestOptions={
            key:fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/privkey.pem`,'ascii'),
            cert:fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/cert.pem`,'ascii')
          }
        }
        
        client.on('connectFailed', function(error) {
            console.log('Connect Error: ' + error.toString());
        });
         
        client.on('connect', function(connection) {
            _this.connection=connection
            console.log('WebSocket Client Connected');
            connection.on('error', function(error) {
                console.log("Connection Error: " + error.toString());
            });
            connection.on('close', function() {
                console.log('Connection Closed!');
            });

        });
        this.client=client
    }
    isConnected(){
        let self=this
        return new Promise((res,rej)=>{
            let keepTesting=true
            setTimeout(function(){
                if(self.connection){
                    keepTesting=false
                    res("Connected")                    
                }else{
                    rej("Timed out")    
                }
            },60000)

            function connected(self,res){
                if(self.connection){
                    res("connected")
                }else{
                    setTimeout(function(){
                       if(keepTesting){
                         connected(self,res)    
                       } 
                    },3000)
                }
            }
            connected(self,res)
        })
    }
    connect(protocolType,routerResult){
        let client=this.client
        let self=this
        let protocol=this.generateProtocol(protocolType)
        this.protocol=this.lowerCaseProtocol(protocol) 
        this.addProtocolToDB(protocol,routerResult).then(protocol=>{
            let connectionProtocol= process.env.mode=="PRODUCTION" ? "wss" : "ws"
            client.connect(`${connectionProtocol}://${HOST}:${PORT}/`,protocol,self.options,self.origin,self.extraRequestOptions);
            
        })

    }
    generateProtocol(type){
      let hash=this.utils.genHash().toString('utf8') 
      return {
            hash,   
            type
        }
    }
    lowerCaseProtocol(protocol){
        Object.keys(protocol).forEach(key=>{
            protocol[key]=protocol[key].toLowerCase()
        })
        return protocol
    }
    sendManifest(readableBuffer){
        let bufferList=readableBuffer.head
        let manifest=[]
        manifest.push({
            base64Slice:bufferList.data.base64Slice(),
            length:bufferList.data.byteLength
        })
        while(bufferList.next!=null){
            manifest.push({
                base64Slice:bufferList.next.data.base64Slice(),
                length:bufferList.next.data.byteLength
            })
            bufferList=bufferList.next
        }
        this.sendMsg(JSON.stringify({manifest}))
    }

    sendMsg(message){
      if(this.connection)
        if(this.connection.connected){
            if (message.type === 'utf8') {
                //console.log('Received Message: ' + message.utf8Data);
                this.connection.sendUTF(message.utf8Data);
            }
            else if (message.readable) {
                if(message.readable){
                    if(message.readableBuffer){
                        let connection=this.connection
                        let rb=message.readableBuffer.head 
                        this.sendManifest(message.readableBuffer)    
                        this.connection.sendBytes(rb.data)
                        while(rb.next!=null){
                            connection.sendBytes(rb.next.data)
                            rb=rb.next
                        }
                    }
                }
                //console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            } else{
                this.connection.sendUTF(message);
            }
        }else{
          console.log("Please connect first")
      }else{
        console.log("Please connect first")
      }    
    }
    close(){
        let protocol=this.protocol
        let connection=this.connection
        this.removeProtocolFromDB(protocol).then(model=>{
            if(model==1){
                connection.close("propagate",protocol)
                var test=0;
            } 
        })
    }
    removeProtocolFromDB(protocol){
        let attributes={
            tablename:"Websocket_protocols",
            where:protocol
        }
        return models.destroySingleTableDynamic(attributes)
    }
    addProtocolToDB(protocol,routerResult){
        let attributes={
            tablename:"Websocket_protocols",
            inserts:{
                type:protocol.type.toLowerCase(),
                hash:protocol.hash.toLowerCase()
            }
        }
        return models.saveSingleTableDynamic(attributes).then(model=>{
            if(model.dataValues){
                let formedProtocol=`${model.type}-${model.hash}`
                routerResult.json(formedProtocol)
                return formedProtocol
            }else{
                routerResult.status(500).json()
                return;
            }
        },rej=>{
            routerResult.status(500).json("Rejected: " + rej)
            return;
        }).catch(err=>{
            routerResult.status(500).json(err)
            return;
        })
    }
}

module.exports={Client} 

 
