var models=require('./../forms/models')
// For this we need the study and name
// name (from the header ex libXX)
// other fields will be filled afterwards

module.exports=function(assay,raw){
	let call="saveSingleTableDynamic"	
	let attributes={
		tablename:"Assay_data",
		inserts:{assay,raw}
	}
	return models[call](attributes)
}