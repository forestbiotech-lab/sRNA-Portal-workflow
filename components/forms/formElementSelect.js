var models=require('./models')
var call="formSelect"


module.exports=function(options){
	return new Promise(function(res,rej){
		models[call](options).then(function(data){
			if(data instanceof Error ) rej(data)
			let result=[]	
			data.forEach(function(row){
				entry=""
				options.attributes.forEach(function(attr){
					entry+=row.dataValues[attr]+" - "
				})
				result.push(entry)
			})
			res(result)
		}).catch(function(err){
			rej(err)
		})
	})

}