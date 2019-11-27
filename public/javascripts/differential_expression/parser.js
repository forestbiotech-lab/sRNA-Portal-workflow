$(document).ready(function(){
	//Get first column of each row
	let conflict=0
	let sequences=[]
	let rowsHashes=[]
	addUploadNumber()
	$('table tbody tr').each(function(index){
		let that=$(this)
		let seq=that.children('td:nth(0)').text()
		sequences.push(seq)
		let row=[]
		that.children('td').each(function(){
			row.push($(this).text())
		})
		hash=hashRow(row)
		rowsHashes.push(hash)
		that.attr("hash",hash)	
	})

	let duplicateHashes=getDuplicates(rowsHashes)	
	duplicateHashes.forEach(function(hash){
		addConflict()
		let targetTable=$('table.duplicate-rows')
		let table=targetTable.clone()
		table.removeClass('duplicate-rows').removeClass('invisible').addClass(`duplicate-rows-${hash}`)
		let newTableTarget=table.find('tbody')
		$(`table.table.upload-table tr[hash|="${hash}"]`).appendTo(newTableTarget)
		targetTable.before(table)

	})
	let duplicateSequences=getDuplicates(sequences)	
	duplicateSequences.forEach(function(seq){
		let rows=$(`table.table.upload-table tr#${seq}`)
		if(rows.length>0){
			addConflict()
			let targetTable=$('table.duplicate-sequences') //table selector
			let table=targetTable.clone()
			table.removeClass('duplicate-sequences').removeClass('invisible').addClass(`duplicate-sequences-${seq}`) //table selector //arg1 dup
			let newTableTarget=table.find('tbody')
			rows.appendTo(newTableTarget) //selector on main table //This one uses id while the other used a new attribute
			targetTable.before(table)
		}
	})





	function getDuplicates(array){
		let uniq = array.map((seq) => {
		    return {
		      count: 1,
		      name: seq
		    }
		  })
		  .reduce((a, b) => {
		    a[b.name] = (a[b.name] || 0) + b.count
		    return a
		  }, {})
		return Object.keys(uniq).filter((a) => uniq[a] > 1)
	}	
	function hashRow(row){
		if( typeof row == "string" ) return md5(row)
		const reducer=(accumulator,currentValue) => accumulator+currentValue;
		return md5(row.reduce(reducer))
	}
	function addUploadNumber(){
		$('.card.upload-table .badge#ofUploadSequences').text(calculateUploadSequences())
	}
	function calculateUploadSequences(){
		return $('table.upload-table tbody tr').length
	}
	function addConflict(){
		conflict++
		$('.card.conflicts .badge#ofConflicts').text(conflict)
		addUploadNumber()
	}

})