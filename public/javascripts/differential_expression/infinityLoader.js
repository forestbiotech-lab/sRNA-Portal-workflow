if (document.location.pathname=="/de/uploaded-file"){
	var uploadMatrix=uploadMatrix || []
	var loadedRows=loadedRows || 0

}
$(document).ready(function(){
	
	let loadedRows=$('table.upload-table tbody tr').length-2
	let filename=$('table.upload-table tr#lastRow').attr('filename')
	const rowsPerIter=100
	let iteration=0
	let fulltable=false
	
	if(filename.length>0){	
		getMatrixObj({filename,responseType:'json'}).then(function(data){
			//let percentageLoaded=Math.round((loadedRows/matrixSize)*100)
			loadRows()
			//alert(percentageLoaded)
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
			rows.push(uploadMatrix.hashLookup[hash])
		})						
		table=$('table.upload-table')
		if(iteration==0) //first
			addHeader(table,uploadMatrix.header)
		populateTable(rows,table)
		iteration++
	}

//	var element = document.getElementById("box");

//	element.scrollIntoView();


})