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
	let tableStruture=[]
	var tableAttributes=db[table].tableAttributes
	Object.keys( tableAttributes ).forEach(function(attribute){
		let type=tableAttributes[attribute].type.key
		tableStruture.push({name:attribute,type:inputType[type]})
	})
	return tableStruture
}

function te(options){
	let tableStruture=[]
	var tableAttributes=db[table].tableAttributes
	Object.keys( tableAttributes ).forEach(function(attribute){
		let type=tableAttributes[attribute].type.key
		tableStruture.push({name:attribute,type:inputType[type]})
	})
	return tableStruture
}





module.exports={
	tableStructure:ts,
	tableEntry:te,
}