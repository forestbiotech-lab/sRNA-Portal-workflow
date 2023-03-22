var WebSocketServer = require('websocket').server;
var http = require('http');
var rootCas=require('ssl-root-cas').create();
var https = require('https')
https.globalAgent.options.ca=rootCas;
var getActiveProtocols= require('./models').getActiveProtocols
var fs=require('fs')

const PORT= require('./.config_res').websocket.port
const DOMAIN = require('./.config_res').host.domain

if (process.env.mode=="PRODUCTION") process.__defineGetter__('stdout', function() { return fs.createWriteStream('/var/log/sRNA-Websocket-Server.log', {flags:'a'}) })

class websocketServer{
    constructor(){
        let that=this
        this.options={}
        if(process.env.mode=="PRODUCTION"){
            this.options={
                //TODO in docker how to import these files, must add them to dockerfile
                key:fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/privkey.pem`,'ascii'),
                cert:fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/fullchain.pem`,'ascii')
            }
        }
        this.server = process.env.mode=="PRODUCTION" ? https.createServer(this.options,this.cb) : http.createServer(this.cb);

        this.server.listen(PORT, function() {
            console.log((new Date()) + ' Server is listening on port '+PORT);
        });
         
        this.wsServer = new WebSocketServer({
            httpServer: this.server,
            // You should not use autoAcceptConnections for production
            // applications, as it defeats all standard cross-origin protection
            // facilities built into the protocol and the browser.  You should
            // *always* verify the connection's origin and decide whether or not
            // to accept it.
            autoAcceptConnections: false
        });
        let server=this.server
        this.wsServer.on('request', function(request) {
            that.validateRequest(that,request)
        });

    }
    cb(request, response) {
        console.log((new Date()) + ' Received request for ' + request.url);
        response.writeHead(404);
        response.end();
    }

    originIsAllowed(origin) {
        // put logic here to detect whether the specified origin is allowed.
        return true;
    }
    set server(server){
        this._server=server
    }
    get server(){
        return this._server
    }
    sendMessageToProtocol(msg,protocol){
        let connections=this.wsServer.activeConnections[protocol]    
        let _this=this
        connections.forEach(connection=>{
            _this.sendMessage(msg,connection)
        })
    }
    sendMessage(message,connection){   //NOT WORKING WELL
        if (message.type === 'utf8') {
            //console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            //console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    }    
    close(){
        let that=this
        this.server.getConnections(function(error, count) {
            if(count==0){
                that.server.close(function() {
                    console.log('We closed!');
                    process.exit();
                });    
            }else{
                that.connection.close()
                that.server.close(function() {
                    console.log('We closed!');
                    process.exit();
                });                
            }
        });
    }
    makeProtocolList(dbResponse){
        let result=[]
        dbResponse.forEach(protocol=>{
            result.push(`${protocol.type}-${protocol.hash}`)
        })
        return result
    }  
    validateProtocol(request,dbProtocols){
        let correctProtocolFound=false
        let authProtocol;
        request.requestedProtocols.forEach(protocol=>{
            if(dbProtocols.indexOf(protocol)>-1){
                correctProtocolFound=true
                authProtocol=protocol
            }        
        })     
        if(!correctProtocolFound){
            request.reject();
            console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected. Invalid Protocol!');
            return -1                   
        }
        return authProtocol
    } 
    validateRequest(that,request){
        if(!that.wsServer.activeConnections){
            that.wsServer.activeConnections={} 
        }
        let activeConnections=that.wsServer.activeConnections 
        getActiveProtocols().then(dbValues=>{
            let dbProtocols=that.makeProtocolList(dbValues)
            let originIsAllowed=that.originIsAllowed(request.origin)
            let authProtocol;
            if (!originIsAllowed){
                // Make sure we only accept requests from an allowed origin
               request.reject();
               console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
               return;
            }else{
               authProtocol=that.validateProtocol(request,dbProtocols) 
            } 
            let connection = authProtocol==-1 ? {on:function(){}} : request.accept(authProtocol, request.origin);
            if (activeConnections[authProtocol]){
                activeConnections[authProtocol].push(connection)  
            }else{
                activeConnections[authProtocol]=[connection]  
            } 
            console.log((new Date()) + ' Connection accepted.');
            
            connection.on('close', function(reasonCode, description) {
                let protocol=this.protocol
                let remoteAddress=this.remoteAddress
                if(remoteAddress=="::ffff:127.0.0.1"){  //IPv4 loopback address written as an IPv6 address works for now!
                    activeConnections[protocol].forEach(connection=>{
                        if(connection.connected){
                            connection.close()
                        }
                    })
                }
                console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            });          
            connection.on('message', function(message) {
                that.sendMessageToProtocol(message,authProtocol)    
            });      
        })
    }
} 


module.exports={websocketServer}
