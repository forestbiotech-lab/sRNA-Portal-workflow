let models=require('./models')


module.exports=function(rows){
	return new Promise(function(res,rej){
		let call="saveSequence"
		let creation=[]
		rows.forEach(function(row){
			let sequence=row[0]
			attributes={insert:{sequence}}
			creation.push(models[call](attributes))
		})
		Promise.all(creation).then(function(data){
			result=[]
			queries=[]
			data.forEach(function(sequence){
				if (sequence instanceof Error){  
					if (sequence.name=="SequelizeUniqueConstraintError"){
						let miRNASeq=sequence.fields
						queries.push(querySequence(miRNASeq))
					}
				}else{
					result.push(sequence)
				}
			})
			queryAndMerge(queries,result,res,rej)	
		}).catch(function(err){
			rej(err)
		})
	})
}



function queryAndMerge(queries,result,res,rej){
	Promise.all(queries).then(function(data){
		data.forEach(function(query){
			query instanceof Error ? rej(query) : result.push(query)
		})
		res(result)
	}).catch(function(err){
		rej(err)
	})
}


function querySequence(attributes){
	let call="getSequenceIdBySequence"
	attributes.where={sequence:attributes.sequence}
	return models[call](attributes)
}