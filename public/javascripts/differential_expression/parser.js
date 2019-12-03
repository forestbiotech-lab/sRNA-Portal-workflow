if (document.location.pathname=="/de/uploaded-file"){
	var uploadMatrix=uploadMatrix || []
}

$(document).ready(function(){
	//Get first column of each row
	let conflict=0
	let duplicatedRows=0
	let duplicatedSeq=0
	let duplicateHashes=[]
	let duplicateSequences=[]

	if(uploadMatrix.length==0){
		console.log("not loaded - waiting to parse")
		varListener.registerListener(function(matrix){
			//alert("loaded")
			uploadMatrix=parseMatrix(matrix)
		})
	}else{
		console.log("Starting to parse....")
		parseMatrix(uploadMatrix)
	}

	function parseMatrix(matrix){

		identifyConflicts(matrix)
		addUploadNumber(Object.keys(matrix.hashLookup).length)
		//filterLoadedRows()
		console.log('parsed matrix')
		return matrix
	}
	
	function identifyConflicts(matrix){
		console.log(matrix)
		duplicateHashes=matrix.duplicateHashes
		duplicateSequences=matrix.duplicateSeq
		header=matrix.header

		var targetTable='duplicate-rows'
		var typeOfTable='hash'	
		duplicateHashes.forEach(function(hash){
			let conflictRows=matrix.hashLookup[hash]
			if(conflictRows.length>0){
				addConflict()
				addDuplicatedSeq()
				loadRowsInTable(hash,header,conflictRows,targetTable,typeOfTable)
			}

		})
		duplicateSequences.forEach(function(seq){
			var typeOfTable='sequence'
			var targetTable='duplicate-sequences'	
			let conflictRows=matrix.seqLookup[seq]
			if(conflictRows.length>0){
				addConflict()
				addDuplicatedRow()
				loadRowsInTable(seq,header,conflictRows,targetTable,typeOfTable)
			}			
		})
	}
	function loadRowsInTable(id,header,rows,targetTable,typeOfTable){
		if(typeof targetTable === "string"){
			let tableClass=`${targetTable}-${id}`
			let targetTableClass= typeOfTable=="hash"? `duplicate-rows` : 'duplicate-sequences'
			table=cloneTable(tableClass,targetTableClass)
		}else{
			/** TODO **/
			table=targetTable
		}
		addHeader(table,header)
		populateTable(rows,table)
	}
	function addUploadNumber(value){
		$('.card.upload-table .badge#ofUploadSequences').text(value)
	}	
	function addDuplicatedRow(){
		duplicatedRows++
		$('.card-header.duplicate-rows .badge#ofDuplicatedRows').text(duplicatedRows)
	}
	function addDuplicatedSeq(){
		duplicatedSeq++
		$('.card-header.duplicate-sequences .badge#ofDuplicatedSequences').text(duplicatedSeq)
	}
	function calculateUploadSequences(uploadSequences){
		//NOT UP TO DATE
		return uploadSequences.length
	}
	function addConflict(){
		conflict++
		$('.card.conflicts .badge#ofConflicts').text(conflict)
		addUploadNumber()
	}

})