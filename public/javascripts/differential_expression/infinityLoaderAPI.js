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
	let header=[]
	let firstcols=["Sequence","Name","Accession"]
	let hiddenColumns="cpm"
    

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
			loadedRows=$('table.upload-table tbody tr').length-1
			addUploadNumber(Object.keys(assayData.rows).length)
			let sequencelist=Object.keys(assayData.rows)
			$('.typeahead').typeahead({ 
        		source:sequencelist,
        		autoSelect:true
      		});
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
			header=createHeader(table,assayData.header)
			let colspan=assayData.header.length
			$('table.upload-table tr#lastRow td').attr('colspan',colspan)
		}
		createAndInsertRows(rows,header,table,'tbody')
		$('table.upload-table tr#lastRow').appendTo('table.upload-table tbody')
		addLoadedRows(rows.length)
		iteration++
		if(loadedRows>=uploadNumber){
			fulltable=true
			$('table.upload-table tr#lastRow').hide()
		} 
		hideColumns()
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



	function createHeader(table,headers){
		headers=arrangeHeader(headers,firstcols)
		var colGroup=document.createElement('colgroup')
		var rowElement=document.createElement('tr')
		returnHeader=[]
		headers.forEach(header=>{
			let cell=document.createElement('th')
			let col=document.createElement('col')
			returnHeader.push(header.value)
			cell.textContent=header.value
			Object.keys(header.metadata).forEach(key=>{
				let value=header.metadata[key] 
				cell.setAttribute(key,value)
				col.setAttribute(key,value)
			})
			rowElement.append(cell)
			colGroup.append(col)
		})
		table.find('thead').html(colGroup)
		table.find('thead').append(rowElement)
        return returnHeader
		 
	}


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



    function arrangeHeader(header,firstcols){
        let columnIndexes=[]
        firstcols.forEach((col)=>{
			header.forEach((val,idx)=>{
				if(val.value==col){
                    columnIndexes.push(idx)        
				}
			})        	
        })
		columnIndexes.forEach((col,idx)=>{
			header.unshift(header[col+idx])
		})
    	columnIndexes.forEach((col,idx)=>{
            delete header[col+columnIndexes.length]
		})
		return header
    }

    function hideColumns(){
    	$(`table th[type|="${hiddenColumns}"]`).hide()
    	$(`table td[type|="${hiddenColumns}"]`).hide()
    }
})