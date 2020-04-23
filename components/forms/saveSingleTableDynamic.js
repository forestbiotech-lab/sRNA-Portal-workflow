var models=require('./models')
var db=require('./../miRNADB/sqldb')

const deletableTables=[
	"Assay_Modality",
	"Modality",
	"Factor"
]

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
	let attributes=options
	return models[call](attributes)
	
}

function update(options){
	options=correctBooleanAttributes(options)
	let call="updateSingleTableDynamic"
	let attributes=options
	let id=options.inserts.id
	options.where={id}
	return	models[call](attributes)
}
function destroy(options){
	if(options.tablename){
		if (deletableTables.indexOf(options.tablename)==-1){
			return new Error('Unauthorized table!')
		}else{
			let id=options.inserts.id
			if(typeof id == "number" || typeof id == "string"){
				return db[options.tablename].destroy({paranoid:true,where:{id}})	
			}			
		}
	}
}


module.exports={
	create:create,
	update:update,
	destroy
}