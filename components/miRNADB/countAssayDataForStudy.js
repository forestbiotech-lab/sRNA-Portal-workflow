var models=require('./models')


module.exports=(studyId =>{
	let call="countAssayDataInStudy"
	let attributes={where:{studyId}}
	return new Promise((res,rej)=>{
		models[call](attributes).then(data=>{
			if(data instanceof Error) rej(data)
			res(data)			
		})
	})


})

