var db=require('./../miRNADB/sqldb')
var models=require('./models')

let inputType={
	INTEGER:"number",
	FLOAT:"number",
	STRING:"text",
	DATE:"date",
	BOOLEAN:"checkbox",
}





function ts(table){
	let tableStructure=[]
	var tableAttributes=db[table].tableAttributes
	Object.keys( tableAttributes ).forEach(function(attribute){
		let type=tableAttributes[attribute].type.key
		tableStructure.push({name:attribute,type:inputType[type]})
	})
	return tableStructure
}

function te(options){
	call="getTableValueById"
	return models[call](options)
}





module.exports={
	tableStructure:ts,
	tableEntry:te,
}