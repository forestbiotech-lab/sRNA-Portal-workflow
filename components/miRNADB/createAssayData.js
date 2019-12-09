var models=require('./../forms/models')
// For this we need the study and name
// name (from the header ex libXX)
// other fields will be filled afterwards

module.exports=function(study,name){
	let call="saveSingleTableDynamic"	
	let attributes={
		tablename:"AssayData"
		inserts:{study,name}
	}
	return models[call](attributes)
}