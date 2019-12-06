var saveSequence=require('./../saveSequence')
var saveAnnotation=require('./../')
var saveAssayData=require('./../')
var createAssay=require('./../createAssay')


//need the assay ids


module.exports=function(dataset){
	new Promise(function(res,rej){
		studyId=dataset.studyId
		header=dataset.header
		rows=dataset.rows
		
		//Sequeces
		extractInsertId(saveSequence(rows)).then(function(sequencesIds){
			sequencesIds.forEach(function(seqId){



			//mature_miRNA
			//seqId(ok), accession,names,arm "5p" (should not be placed yet)  
			createMature


			//annoation after mature and assay_data
			//mature (change to mature_miRNA_id), data (change to date) default to now, 
			//version determineAnnotVersion(), assay_data_id


			})
		}).catch(function(err){
			rej(err)
		})




		createAssays=[]
		header.forEach(function(colname,index){
			if(index>1){ //This is excluding the first to cols 0-sequence, 1-type
				createAssays.push(createAssay(study,name))
			}
		})
		//Assays
		Promise.all().then(function(assayIds){
			assayId=extractInsertIds(assayIds)

		}).catch(function(err){
			rej(err)
		})
	})

}



function extractInsertIds(model){
	new Promise(function(res,rej){
		model.then(function(data){
			if (data instanceof Error) rej(data) //place contraint on id,name as unique if contraint error detected lookup the id to resume
			ids=[]
			data.forEach(function(datum){
				ids.push(dataum.dataValues.id)
			})
			res(ids)
		}).catch(function(err){
			rej(err)
		})
	})
}


function determineAnnotVersion(newAssay,sequenceId,assayId){
	//needs to know if this is a newly created assay if s
	newAssay=newAssay || true
	if (newAssay){	
		return 1
	}else{
		// sequence has another anotation for this assay get highest version and increment
		//if(sequenceAnnoation && assayExist)
		//	return getLastAnnotationVersion(sequences,assay)++
	}
}
