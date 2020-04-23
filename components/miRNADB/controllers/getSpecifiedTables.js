var db=require('.././sqldb/')
var fmtRetreivedData= require('./../helpers/formatRetreivedData')
var queryModel=require('./../helpers/queryModel')


module.exports=function(sourceTable,tableConnections,callOutputStructure){
	return new Promise(function(res,rej){
		let query=new queryModel(tableConnections,db)
		let callStructure={metadata:{},attribute:'id',callStructure:callOutputStructure}
		query.buildQueryModel()
		db[sourceTable].findAndCountAll(query.query).then(function(data){
			if(data instanceof Error) rej(data)
			let result=fmtRetreivedData(callStructure,data)
			res(result)
		},rejection=>{
			rej(rejection)
		}).catch(function(err){
			rej(err)			
		})
	})
}




