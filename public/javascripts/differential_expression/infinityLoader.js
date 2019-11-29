$(document).ready(function(){
	
	let loadedRows=$('table.upload-table tbody tr').length-1
	let filename=$('table.upload-table tr#lastRow').attr('filename')
	let fulltable=false
	console.log(filename)
	
	if(filename.length>0){	
		getMatrixObj({filename,resultType:'json'}).then(function(data){
			console.log(data)
			const matrixSize=data.body.length
			let percentageLoaded=Math.round((loadedRows/matrixSize)*100)
			alert(percentageLoaded)
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
				sucess: function(data,textStatus,jqXHR){
					console.log(data)
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