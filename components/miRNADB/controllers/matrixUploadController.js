var saveSequence=require('./../saveSequence')
var createAnnotation=require('./../createAnnotation')
var createAssayData=require('./../createAssayData')
var createAssay=require('./../createAssay')
var createMature=require('./../createMature')

//need the assay ids


module.exports=function(dataset){
	return new Promise(function(res,rej){
		let studyId=dataset.studyId
		let header=dataset.headers
		let rows=dataset.rows
		let maturePromises=[]
		let annotation=0

		//Sequeces
		extractInsertIds(saveSequence(rows)).then(function(sequencesIds){
			assayPromises=[]
			header.forEach(function(colname,index){
				if(index>1){ //This is excluding the first to cols 0-sequence, 1-type
					let name=colname
					assayPromises.push(createAssay(studyId,name))
				}
			})
			sequencesIds.forEach(function(seqId,y){
				let name=rows[y][1]
				let accession=genAccession(name)
				maturePromises.push(createMature(seqId,name,accession))

				let assayModels=Promise.all(assayPromises)
				let mature_miRNA_models=Promise.all(maturePromises)
				extractInsertIds(assayModels).then(function(assayIDs){
					assayIDs.forEach(function(assay_id,x){
						let raw=rows[y][x+2]
						let assay_data_model=Promise.all([createAssayData(assay_id,raw)])
						let mature_and_assayData_promises=[]
						mature_and_assayData_promises.push(extractInsertIds(mature_miRNA_models))
						mature_and_assayData_promises.push(extractInsertIds(assay_data_model))
						
						Promise.all(mature_and_assayData_promises).then(function(ids){
							mature_miRNA_id=ids[0][y]
							assay_data_id=ids[1]
							version=determineAnnotVersion()
							createAnnotation(mature_miRNA_id,version,assay_data_id).then(function(final){
								annotation++
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
		
		}).catch(function(err){
			rej(err)
		})
		res(annotation)
	})
}



function extractInsertIds(model){
	return new Promise(function(res,rej){
		model.then(function(data){
			if (data instanceof Error) rej(data) //place contraint on id,name as unique if contraint error detected lookup the id to resume
			ids=[]
			data.forEach(function(datum){
				ids.push(datum.dataValues.id)
			})
			res(ids)
		}).catch(function(err){
			rej(err)
		})
	})
}

//do something hash? use algorithum
function genAccession(name){
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