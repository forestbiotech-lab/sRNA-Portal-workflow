if (document.location.pathname=="/de/uploaded-file"){
	var uploadMatrix=uploadMatrix || []
	var loadedRows=loadedRows || 0
}

$(document).ready(function(){
	//Get first column of each row
	let conflict=0
	let duplicatedRows=0
	let duplicatedSeq=0
	let sequences=[]
	let rowsHashes=[]
	let duplicateHashes=[]
	let duplicateSequences=[]

	if(uploadMatrix.length==0){
		console.log("not loaded - waiting to parse")
		varListener.registerListener(function(matrix){
			alert("loaded")
			uploadMatrix=parseMatrix(matrix)
		})
	}else{
		console.log("Starting to parse....")
		parseMatrix(uploadMatrix)
	}



//	//Do this to first 100 sequences already loaded
//			 
	$('table tbody tr').each(function(){
		addLoadedRow()
		let that=$(this)
//		let seq=that.children('td:nth(0)').text()
//		sequences.push(seq)
		let row=[]
		that.children('td').each(function(){
			row.push($(this).text())
		})
		hash=hashRow(row)
//		rowsHashes.push(hash)
		that.attr("hash",hash)	
	})
	console.log('loadedHashes')


	duplicateHashes.forEach(function(hash){
		//addConflict()
		//let targetTable=$('table.duplicate-rows')
		//let table=targetTable.clone()
		//table.removeClass('duplicate-rows').removeClass('invisible').addClass(`duplicate-rows-${hash}`)
		//let newTableTarget=table.find('tbody')
		//$(`table.table.upload-table tr[hash|="${hash}"]`).appendTo(newTableTarget)
		$(`table.table.upload-table tr[hash|="${hash}"]`).empty()
		//targetTable.before(table)

	})
	console.log('Removed duplicate Rows')
	duplicateSequences.forEach(function(seq){
		let rows=$(`table.table.upload-table tr#${seq}`)
		if(rows.length>0){
//			addConflict()
//			let targetTable=$('table.duplicate-sequences') //table selector
//			let table=targetTable.clone()
//			table.removeClass('duplicate-sequences').removeClass('invisible').addClass(`duplicate-sequences-${seq}`) //table selector //arg1 dup
//			let newTableTarget=table.find('tbody')
//
//			rows.appendTo(newTableTarget) //selector on main table //This one uses id while the other used a new attribute
//			targetTable.before(table)
			$(`table.table.upload-table tr#${seq}`).empty()
		}
	})
	console.log('Removed duplicate seq')



	function parseMatrix(matrix){
		//indexing clientSide should it be server side?
		matrix.seqLookup={} 
		matrix.hashLookup={} 
		matrix.loaded=[]
		matrix.body.forEach(function(row,index){
			if(row.length>0){
				let seq=row[0]
				let hash=hashRow(row)
				sequences.push(seq)
				rowsHashes.push(hash)
				matrix.seqLookup[seq] ? matrix.seqLookup[seq].push(row) : matrix.seqLookup[seq]=[row] 
				matrix.hashLookup[hash] ? matrix.hashLookup[hash].push(row) : matrix.hashLookup[hash]=[row] 
			}
		})
		identifyConflicts(matrix)
		addUploadNumber(Object.keys(matrix.hashLookup).length)
		//filterLoadedRows()
		console.log('parsed matrix')
		return matrix
	}
	
	function identifyConflicts(matrix){
		duplicateHashes=getDuplicates(rowsHashes)
		duplicateSequences=getDuplicates(sequences)

		var targetTable='duplicate-rows'
		var typeOfTable='hash'	
		duplicateHashes.forEach(function(hash){
			let conflictRows=matrix.hashLookup[hash]
			if(conflictRows.length>0){
				addConflict()
				addDuplicatedSeq()
				loadRowsInTable(hash,conflictRows,targetTable,typeOfTable)
			}

		})
		duplicateSequences.forEach(function(seq){
			var typeOfTable='sequence'
			var targetTable='duplicate-sequences'	
			let conflictRows=matrix.seqLookup[seq]
			if(conflictRows.length>0){
				addConflict()
				addDuplicatedRow()
				loadRowsInTable(seq,conflictRows,targetTable,typeOfTable)
			}			
		})
	}
	function loadRowsInTable(id,rows,targetTable,typeOfTable){
		if(typeof targetTable === "string"){
			let tableClass=`${targetTable}-${id}`
			let targetTableClass= typeOfTable=="hash"? `duplicate-rows` : 'duplicate-sequences'
			table=makeTable(tableClass,targetTableClass)
		}else{
			/** TODO **/
			table=targetTable
		}
		populateTable(rows,table)
	}
	function convertRow2HTML(rows){
		result=""
		rows.forEach(function(row){
			result+="<tr>"
			row.forEach(function(col){
				result+=`<td>${col}</td>`
			})
			result+="</tr>"
		})
		return result
	}
	function populateTable(rows,table){
		let newTableTarget=table.find('tbody')
		newTableTarget.html(convertRow2HTML(rows))
		//rows.appendTo(newTableTarget) //selector on main table //This one uses id while the other used a new attribute
	}
	function makeTable(tableClass,targetTableClass){
		let targetTable=$(`table.${targetTableClass}`) //table selector
		let table=targetTable.clone()
		table.removeClass(targetTableClass).removeClass('invisible').addClass(tableClass) //table selector //arg1 dup
		targetTable.before(table)
		return table
	}
	function addUploadNumber(value){
		$('.card.upload-table .badge#ofUploadSequences').text(value)
	}
	function addLoadedRow(){
		loadedRows++
		$('.card.upload-table .badge#ofLoadedRows').text(loadedRows)
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