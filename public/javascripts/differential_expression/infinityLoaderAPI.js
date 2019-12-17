// This is the infinityLoader for api calls
$(document).ready(function(){
	let assayData=[]
	let loadedRows=0
	let api=$('.card.gen-info').attr('api')
	const rowsPerIter=10
	const dataPointsPerRow=9
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
		url=`/db/api/${version}/${call}/${studyId}`
		getMatrixObj(url).then(function(data){
			assaydata=data.result.data
			lastRow=document.getElementById("lastRow");
			loadedRows=$('table.upload-table tbody tr').length-2
			addUploadNumber(assaydata.length)
			loadRows()
		}).catch(function(err){
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
		let start=iteration*rowsPerIter*dataPointsPerRow
		let rows=assaydata.slice(start,start+rowsPerIter*dataPointsPerRow)

		loadMatrix=assembleRows(rows)
		rows=loadMatrix.rows
		table=$('table.upload-table')
		if(iteration==0){
			addHeader(table,loadMatrix.header[0])
			let colspan=loadMatrix.header[0].length
			$('table.upload-table tr#lastRow td').attr('colspan',colspan)
		}
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
		if(iteration>=1){
			var distanceFromTop=lastRow.getBoundingClientRect().top
			var relElDistance= ( distanceFromTop - viewPortHeight ) / viewPortHeight 
			if ( relElDistance <= 0.05 && ! fulltable ) loadRows()	
		}
	}
	$(window).on('resize',function(){
		viewPortHeight=window.innerHeight

	})

	function assembleRows(rows){
		let result={}
		let resultHeaders=""
		let headers=[]
		rows.forEach(row=>{
			let groupingElement={key:"",value:""}
			let cols=[]	
			Object.keys(row).forEach(key=>{
				let value=row[key] || 0
				let subKeys=Object.keys(value)
				let subKey=""
				//process Keys
				if( subKeys.length==1)
					subKey=subKeys[0]
					subValue=value[subKey]
				if( key == "group" ){
					groupingElement={key:subKey,value:subValue}
				} else if( key == "header"){
					headers.push({key:subKey,value:subValue})
				} else{
					cols.push({key:key,value:value})
				}
			})
			cols.forEach(col=>{
				cKey=col.key
				cValue=col.value
				gValue=groupingElement.value
				if(result[gValue]){
					if(result[gValue][cKey])
						result[gValue][cKey].push(cValue)
					else
						result[gValue][cKey]=[cValue]
				}else{
					result[gValue]={}
					result[gValue][cKey]=[cValue]
					if(headers.length>1){
						resultHeaders=headers
						headers=[resultHeaders.pop()]
						if(iteration==0){
							headerSpan=resultHeaders.length
						}else{
							if(resultHeaders.length!=headerSpan){
								throw "Matrix is corrupted."
							}
						}	
					}
				}
			})
			resultHeaders=headers
		})
		if(iteration>0 && resultHeaders.length!=headerSpan){
			throw "Matrix is corrupted."
		}else if (iteration==0 && headerSpan==0){
			headerSpan=resultHeaders.length
		}else if(resultHeaders.length!=headerSpan){
			throw "Matrix is corrupted."
		}
		matrix={header:[],rows:[]}
		Object.keys(result).forEach(seq=>{
			let row=[]
			let headers=[]
			seqData=result[seq]
			Object.keys(seqData).forEach(attrKey=>{
				seqData[attrKey].forEach((val,index)=>{
					row.push(val)
					headers.push(`${resultHeaders[index].value}(${attrKey})`)					
				})

			})
			matrix.rows.push(row)
			matrix.header.push(headers)
		})
		return matrix
	}

})