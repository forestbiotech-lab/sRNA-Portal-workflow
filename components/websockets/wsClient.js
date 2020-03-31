var WebSocketClient = require('websocket').client;
var models=require('./../forms/models')

const HOST="localhost"
const PORT=8080

class Client{
    constructor(){
        let client = new WebSocketClient();
        let _this=this
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
        this.protocol=this.lowerCaseProtocol(protocol)
        this.addProtocolToDB(protocol,routerResult).then(protocol=>{
            client.connect(`wss://${HOST}:${PORT}/`, protocol);
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

 
