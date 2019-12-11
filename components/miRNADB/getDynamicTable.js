var models=require('./../forms/models')
// For this we need the study and name
// name (from the header ex libXX)
// other fields will be filled afterwards

module.exports=function(tablename,where){
	return new Promise(function(res,rej){
		let call="getTableValuesWhere"	
		let attributes={tablename,where}
		models[call](attributes).then(function(data){
			if(data instanceof Error) rej(data)
			result=[]	
			data.forEach(function(row){
				result.push(row.dataValues)
			})	
			res(result)
		}).catch(function(err){
			rej(err)
		})
	})
}