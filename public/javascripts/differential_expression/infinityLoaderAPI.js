// This is the infinityLoader for api calls
$(document).ready(function(){
	let assayData=[]
	let loadedRows=0
	let api=$('.card.gen-info').attr('api')
	const rowsPerIter=10
	let iteration=0
	let fulltable=false
	let viewPortHeight=window.innerHeight
	let lastRow = null
	let uploadNumber=0
	let headerSpan=0
	


//Specific 
	if(api){	
		let apiInfo=$('.card.gen-info')
		let call=apiInfo.attr("call")
		let version=apiInfo.attr("version")
		let studyId=apiInfo.attr("studyId")
		url=`/de/assaydata/${studyId}/matrix`
		getMatrixObj(url).then(function(data){
			assayData=data
			lastRow=document.getElementById("lastRow");
			loadedRows=$('table.upload-table tbody tr').length-2
			addUploadNumber(Object.keys(assayData.rows).length)
			loadRows()
		}).catch(function(err){
			console.trace(err)
			alert(err)
		})
	}



//Generic
	function getMatrixObj(url){
		return new Promise(function(res,rej){
			$.ajax({
				url:url,
				type: 'GET',
				dataType: 'json',
				success: function(dataRes,textStatus,jqXHR){	
					res(dataRes)
				},error:function(qXHR,textStatus,err){
					console.log(err)
					rej(err)
				}
			})		
		})
	}

	function loadRows(){
		let start=iteration*rowsPerIter
		let seqs=Object.keys(assayData.rows).slice(start,start+rowsPerIter)

		rows=[]
		seqs.forEach(seq=>{
			rows.push(assayData.rows[seq])
		})
		table=$('table.upload-table')
		if(iteration==0){
			addHeader(table,assayData.header)
			let colspan=assayData.header.length
			$('table.upload-table tr#lastRow td').attr('colspan',colspan)
		}
		createAndInsertRows(rows,assayData.header,table,'tbody')
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
		if(iteration>=1){
			var distanceFromTop=lastRow.getBoundingClientRect().top
			var relElDistance= ( distanceFromTop - viewPortHeight ) / viewPortHeight 
			if ( relElDistance <= 0.05 && ! fulltable ) loadRows()	
		}
	}
	$(window).on('resize',function(){
		viewPortHeight=window.innerHeight
	})




function createAndInsertRows(rows,headers,table,element){
	let tableTarget=table.find(element)
	appendRows(headers,rows,tableTarget)
}
function appendRows(headers,rows,tableTarget){
	rows.forEach(row=>{
		tableTarget.append(createRow(headers,row))
	})
}

function createRow(headers,row){
	var rowElement=document.createElement('tr')
	headers.forEach(header=>{
		dataPoint=row[header]
		let cell=document.createElement('td')
		cell.textContent=dataPoint.value
		Object.keys(dataPoint.metadata).forEach(key=>{
			let value=dataPoint.metadata[key] 
			cell.setAttribute(key,value)
		})
		rowElement.append(cell)
	})
	return rowElement
}



})