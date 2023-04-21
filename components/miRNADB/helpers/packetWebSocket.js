module.exports = class Packet{
    constructor(ws) {
        this.payload={
            percentageComplete:0,
            errorsMsg:"",
            errors:0,
            error:false,
            successesMsg:"",
            successes:0,
            total:0,
            finished:false
        }
        this.ws=ws
    }
    set success(success){
        this.payload.successesMsg=success.msg
        this.payload.successes++
        this.payload.error=false
        this.calculatePercentage()
        this.sendUpdate()
    }
    set error(error){
        this.payload.errorsMsg=error.message
        this.payload.error=true
        this.payload.errors++
        this.calculatePercentage()
        this.sendUpdate()
    }
    set percentageComplete(percent){
        this.payload.percentageComplete=percent
    }
    set total(total){
        this.payload.total=total
    }
    calculatePercentage(){
        let sum=this.payload.errors
        sum+=this.payload.successes
        this.payload.percentageComplete=(sum/this.payload.total)*100
    }
    sendUpdate(){
        this.ws.sendMsg(JSON.stringify(this.payload))
    }
    keepAlive(){
        this.sendUpdate()
    }
    async isConnected(){
        return this.ws.connection.connected
    }
    finished(){
        this.payload.finished=true
        this.sendUpdate()
        this.ws.close()
    }

}