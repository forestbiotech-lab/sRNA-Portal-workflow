var models=require('./../forms/models')

// name (header)
study and name
// name (from the header ex libXX)
module.exports=function(sequence_id,name,accession){
	let call="saveSingleTableDynamic"	
	let attributes={
		tablename:"Mature_miRNA"
		inserts:{sequence_id,name,accession,}
	}
	return models[call](attributes)
}

