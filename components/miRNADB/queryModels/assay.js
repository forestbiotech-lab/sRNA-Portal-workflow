var structure=require('../structures/./assay')
var controller=require('../controllers/./getSpecifiedTables')

module.exports={
	index
}


function index(study_id){
	var sourceTable='Assay'
	let where={study:study_id}
	let tableConnections={
		Assay_Modality:{
			Modality:{
				Factor:{}
			}
		}
		,where
	}
	return controller(sourceTable,tableConnections,structure)
}