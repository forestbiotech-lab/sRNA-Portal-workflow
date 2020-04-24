var models=require('./models')
var call="formSelect"


module.exports=function(options){
	return new Promise(function(res,rej){
		models[call](options).then(function(data){
			if(data instanceof Error ) rej(data)
			let result=[]	
			data.forEach(function(row){
				let entry={}
				let text=""
				options.attributes.forEach(function(attr){
					entry[attr]=row.dataValues[attr]
					text+=row.dataValues[attr]+"@€"
				})
				entry['text']=text.replace(/@€/,"-").replace(/@€/g," ")
				result.push(entry)
			})
			res(result)
		}).catch(function(err){
			rej(err)
		})
	})

}