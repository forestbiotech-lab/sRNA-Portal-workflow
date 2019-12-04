var models=require('./models')


module.exports=function(options){
	let call="saveSingleTableDynamic"
	return new Promise(function(res,rej){
		let attributes=options
		res(models[call](attributes))
	})
}