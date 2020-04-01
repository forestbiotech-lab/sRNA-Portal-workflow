var WebSocketClient = require('websocket').client;
var models=require('./../forms/models')
var fs = require('fs')

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
                console.log('echo-protocol Connection Closed');
            });
        });
        this.client=client
    }
    connect(protocol,routerResult){
        let client=this.client
        let self=this
        this.protocol=this.lowerCaseProtocol(protocol) 
        this.addProtocolToDB(protocol,routerResult).then(protocol=>{
            let connectionProtocol= process.env.mode=="PRODUCTION" ? "wss" : "ws"
            client.connect(`${connectionProtocol}://${HOST}:${PORT}/`,protocol,self.options,self.origin,self.extraRequestOptions);
            
        })
    }
    lowerCaseProtocol(protocol){
        Object.keys(protocol).forEach(key=>{
            protocol[key]=protocol[key].toLowerCase()
        })
        return protocol
    }
    sendMsg(msg){
        if(this.connection.connected){
            this.connection.sendUTF(msg)
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

 
