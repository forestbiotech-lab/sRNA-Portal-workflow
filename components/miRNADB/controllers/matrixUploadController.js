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

		createMatures=[]	//Async	
		//Sequeces
		extractInsertIds(saveSequence(rows)).then(function(sequencesIds){
			sequencesIds.forEach(function(seqId,index){

				//mature_miRNA
				let name=rows[index][1]
				let accession=genAccession(name)
				createMature.push(createMature(seqId,name,accession))
				//annoation after mature and assay_data
				//mature (change to mature_miRNA_id), data (change to date) default to now, 
				//version determineAnnotVersion(), assay_data_id
				//combine AssayData with Mature
						//Assays
				createAssays=[]
				header.forEach(function(colname,index){
					if(index>1){ //This is excluding the first to cols 0-sequence, 1-type
						createAssays.push(createAssay(study,name))
					}
				})
				Promise.all(createAssays).then(function(assay_ids){
					Promise.all(createMatures).then(function(mature_miRNA_models){	
						extractInsertIds(assay_ids)
						.forEach(function(assay_id,x){
							rows.forEach(function(row,y){
								let raw=row[x+2]
				
								createAssayData(assay_id,raw).then(function(assay_data_model){
									mature_miRNA_id=extractInsertIds(mature_miRNA_models)[y]
									assay_data_id=extractInsertIds([assay_data_model])
									version=determineAnnotVersion()
									//date=default should set it
									createAnnotation(mature_id,version,assay_data_id).then(function(final){
										//This is the ultimate resolve this is runs a couple of time
										// I think this should do something.... once last resolves
										//Ideally send a stream....
									})

								}).catch(function(err){
									rej(err)
								})
							})

						})

					}).catch(function(err){
						rej(err)
					})
				}).catch(function(err){
						rej(err)
				})
			
			})
		
		}).catch(function(err){
			rej(err)
		})

	})
}



function extractInsertIdss(model){
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

//do something hash? use algorithum
genAccession(name){
	return name
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
