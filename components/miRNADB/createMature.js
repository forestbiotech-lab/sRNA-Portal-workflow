var models=require('./../forms/models')
// For this we need the 
// seqId, 
// name (header)
study and name
// name (from the header ex libXX)
// other fields will be filled afterwards

module.exports=function(seqId,name,accession){
	let arm="5p" //this should not mandatory
	let call="saveSingleTableDynamic"	
	let attributes={
		tablename:"Mature_miRNA"
		inserts:{study,name}
	}
	return models[call](attributes)
}

