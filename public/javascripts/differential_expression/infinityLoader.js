$(document).ready(function(){
	let uploadMatrix=[]
	let loadedRows=0
	let filename=$('table.upload-table tr#lastRow').attr('filename')
	const rowsPerIter=100
	let iteration=0
	let fulltable=false
	let viewPortHeight=window.visualViewport.height
	let lastRow = null
	let uploadNumber=0
	
	if(filename)if(filename.length>0){	
		getMatrixObj({filename,responseType:'json'}).then(function(data){
			uploadMatrix=data
			lastRow=document.getElementById("lastRow");
			loadedRows=$('table.upload-table tbody tr').length-2
			addUploadNumber(Object.keys(data.hashLookup).length)
			loadRows()
		}).catch(function(err){
			alert(err)
		})
	}


	function getMatrixObj(data){
		return new Promise(function(res,rej){
			$.ajax({
				url:"/de/uploaded-file",
				type: 'POST',
				data: data,
				dataType: 'json',
				success: function(data,textStatus,jqXHR){
					uploadMatrix=data
					varListener.a = data
					res(data)
				},error:function(qXHR,textStatus,err){
					console.log(err)
					rej(err)
				}
			})		
		})
	}

	function loadRows(){
		let start=iteration*rowsPerIter
		let hashes=Object.keys(uploadMatrix.hashLookup).slice(start,start+rowsPerIter)
		let rows=[]
		hashes.forEach(function(hash){
			//test for arrays
			let row=uploadMatrix.hashLookup[hash]
			if (row.length == 1)
				if( uploadMatrix.duplicateSeq.indexOf( row[0][0] ) ==-1 )
					rows.push(row[0])
		})						
		table=$('table.upload-table')
		if(iteration==0){
			addHeader(table,uploadMatrix.header)
			let colspan=uploadMatrix.header.length
			$('table.upload-table tr#lastRow td').attr('colspan',colspan)
		} //first
		insertInEl(rows,table,'tbody')
		$('table.upload-table tr#lastRow').appendTo('table.upload-table tbody')
		addLoadedRows(rows.length)
		iteration++
		if(loadedRows>=uploadNumber) fulltable=true
	}
	function addLoadedRows(value){
		loadedRows+=value
		$('.card.upload-table .badge#ofLoadedRows').text(loadedRows)
	}
	function addUploadNumber(value){
		uploadNumber=value
		$('.card.upload-table .badge#ofUploadSequences').text(value)
	}	


	window.onscroll = function(){ 
		var distanceFromTop=lastRow.getBoundingClientRect().top
		var relElDistance= ( distanceFromTop - viewPortHeight ) / viewPortHeight 
		if ( relElDistance <= 0.05 && ! fulltable && iteration>=1 ) loadRows()
	}
	$(window).on('resize',function(){
		viewPortHeight=window.visualViewport.height

	})

})