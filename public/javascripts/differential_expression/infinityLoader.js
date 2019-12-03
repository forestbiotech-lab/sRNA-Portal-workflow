if (document.location.pathname=="/de/uploaded-file"){
	var uploadMatrix=uploadMatrix || []

}
$(document).ready(function(){
	
	let loadedRows=$('table.upload-table tbody tr').length-2
	let filename=$('table.upload-table tr#lastRow').attr('filename')
	const rowsPerIter=100
	let iteration=0
	let fulltable=false
	
	if(filename.length>0){	
		getMatrixObj({filename,responseType:'json'}).then(function(data){
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
	}
	function addLoadedRows(value){
		loadedRows+=value
		$('.card.upload-table .badge#ofLoadedRows').text(loadedRows)
	}
//	var element = document.getElementById("box");

//	element.scrollIntoView();


})