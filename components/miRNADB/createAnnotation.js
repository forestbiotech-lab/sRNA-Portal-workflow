var models=require('./../forms/models')
// For this we need the study and name
// name (from the header ex libXX)
// other fields will be filled afterwards

module.exports=function(mature_miRNA_id,version,assay_data_id){
	let call="saveSingleTableDynamic"	
	let attributes={
		tablename:"Annotation",
		inserts:{mature_miRNA_id,version,assay_data_id}
	}
	return models[call](attributes)
}