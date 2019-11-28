let models=require('./models')


module.exports=function(row){
	return new Promise(function(res,rej){
		let call="saveSequence"
		let sequence=row.row[0]
		let attributes={insert:{sequence}}
		models[call](attributes).then(function(data){
			if (data instanceof Error){  
				if (data.name!="SequelizeUniqueConstraintError") rej(data)
				querySequence(attributes).then(function(data){
					data instanceof Error ? rej(data) : res(data)
				}).catch(function(err){
					rej(err)
				})
			}else{
				res(data)
			}
		}).catch(function(err){
			rej(err)
		})
	})
}


function querySequence(attributes){
	let call="getSequenceIdBySequence"
	attributes.where=attributes.insert
	return models[call](attributes)
}