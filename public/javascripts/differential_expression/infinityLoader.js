if (document.location.pathname=="/de/uploaded-file"){
	var uploadMatrix=uploadMatrix || []
	var loadedRows=loadedRows || 0

}
$(document).ready(function(){
	
	let loadedRows=$('table.upload-table tbody tr').length-1
	let filename=$('table.upload-table tr#lastRow').attr('filename')
	let fulltable=false
	
	if(filename.length>0){	
		getMatrixObj({filename,resultType:'json'}).then(function(data){
			const matrixSize=data.body.length
			let percentageLoaded=Math.round((loadedRows/matrixSize)*100)
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

//	var element = document.getElementById("box");

//	element.scrollIntoView();


})