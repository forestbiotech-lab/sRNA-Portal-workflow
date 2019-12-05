var models=require('./models')
var db=require('./../miRNADB/sqldb')

function correctBooleanAttributes(options){
	let tableStructure=[]
	var tableAttributes=db[options.tablename].tableAttributes
	Object.keys( tableAttributes ).forEach(function(attribute){
		let type=tableAttributes[attribute].type.key
		if (type=="BOOLEAN") 
			tableStructure.push({name:attribute,type})
	})
	if(tableStructure.length==0){
		return options
	}else{
		let insertAttributes=options.inserts
		tableStructure.forEach(function(attr){
			if(Object.keys(insertAttributes).indexOf(attr.name)==-1){
				options.inserts[attr.name]=false
			}else{
				options.inserts[attr.name]=true
			}
		})
		return options
	}

}


function create(options){
	options=correctBooleanAttributes(options)
	let call="saveSingleTableDynamic"
	return new Promise(function(res,rej){
		let attributes=options
		res(models[call](attributes))
	})
}

function update(options){
	options=correctBooleanAttributes(options)
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