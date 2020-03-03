var WebSocketServer = require('websocket').server;
var http = require('http');
var getActiveProtocols= require('./models').getActiveProtocols

const PORT=8080

class websocketServer{
    constructor(){
        //let authProtocol=`upload-protocol-${hash}`
        this._connection=null
        this.server = http.createServer(function(request, response) {
            console.log((new Date()) + ' Received request for ' + request.url);
            response.writeHead(404);
            response.end();
        });

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
        this.wsServer.on('request', function(request) {
            getActiveProtocols().then(protocols=>{
                if (!originIsAllowed(request.origin)) {
                    // Make sure we only accept requests from an allowed origin
                   request.reject();
                   console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
                   return;
                }else{
                   let correctProtocolFound=false
                   request.requestedProtocols.forEach(protocol=>{
                        if(authProtocol.indexOf(protocol)!=-1){
                            correctProtocolFound=true
                        }        
                   })     
                   if(!correctProtocolFound){
                        request.reject();
                        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected. Invalid Protocol!');
                        return                    
                    }
                }   
            })
            this.connection = request.accept(authProtocol, request.origin);
            console.log((new Date()) + ' Connection accepted.');
            this.connection.on('message', function(message) {
                if (message.type === 'utf8') {
                    console.log('Received Message: ' + message.utf8Data);
                    this.connection.sendUTF(message.utf8Data);
                }
                else if (message.type === 'binary') {
                    console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                    this.connection.sendBytes(message.binaryData);
                }
            });
            let connection=this.connection
            this.connection.on('close', function(reasonCode, description) {
                console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            });
        });

        function originIsAllowed(origin) {
            // put logic here to detect whether the specified origin is allowed.
            return true;
        }
    }
    sendMessage(msg){   //NOT WORKING WELL
        if(this.connection){
            let con=this.connection
            con.sendUTF(msg)                
        }else{
            console.log('No connection established!')
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
    get connection(){
        if(this._connection==null){
            this._connection=this.wsServer.connection
        }
        return this._connection
    }    
} 


module.exports={websocketServer}