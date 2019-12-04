var db=require('./../miRNADB/sqldb')


module.exports=function(table){
	inputType={
		INTEGER:"number",
		FLOAT:"number",
		STRING:"text",
		DATE:"date",
		BOOLEAN:"checkbox",
	}

	let tableStruture=[]
	var tableAttributes=db[table].tableAttributes
	Object.keys( tableAttributes ).forEach(function(attribute){
		let type=tableAttributes[attribute].type.key
		tableStruture.push({name:attribute,type:inputType[type]})
	})
	return tableStruture
}