var models=require('./models')

function create(options){
	let call="saveSingleTableDynamic"
	return new Promise(function(res,rej){
		let attributes=options
		res(models[call](attributes))
	})
}

function update(options){
	let call="updateSingleTableDynamic"
	let attributes=options
	let id=options.inserts.id
	options.where={id}
	return	models[call](attributes)
}



module.exports={
	create:create,
	update:update
}