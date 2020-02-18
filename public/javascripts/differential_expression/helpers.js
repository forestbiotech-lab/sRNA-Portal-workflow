function hashRow(row){
	if( typeof row == "string" ) return md5(row)
	const reducer=(accumulator,currentValue) => accumulator+currentValue;
	return md5(row.reduce(reducer))
}
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
function convertRow2HTML(rows,header,metadata){
	result=""
	rows.forEach(function(row){
		result+="<tr>"
		row.forEach(function(col){
			el= header? 'th' : 'td'
			result+=`<${el}>${col}</${el}>`
		})
		result+="</tr>"
	})
	return result
}
function populateTable(rows,table){
	let newTableTarget=table.find('tbody')
	newTableTarget.html(convertRow2HTML(rows))
}
function insertInEl(rows,table,element){
	let tableTarget=table.find(element)
	tableTarget.append(convertRow2HTML(rows))
}
function cloneTable(tableClass,targetTableClass){
	let targetTable=$(`table.${targetTableClass}`) //table selector
	let table=targetTable.clone()
	table.removeClass(targetTableClass).removeClass('invisible').addClass(tableClass) //table selector //arg1 dup
	targetTable.before(table)
	return table
}
function addHeader(table,header){
	table.find('thead').html(convertRow2HTML([header],true))
}
function makeTableFromNestedArrayMatrix(matrix,customHeaders){ //rename to makeTableFromNestedObjectArray
	// Generates a table from an array of objects into a table
	// [{h1:val,h2:val,(...)},{h1:val,h2:val,(...)},{h1:val,h2:val,(...)},{h1:val,h2:val,(...)},(...),{h1:val,h2:val,(...)}]
	// Headers are extracted from object keys or customHeaders 
	customHeaders=customHeaders || []
  let table=document.createElement('table','customHeaders')
	let thead = document.createElement('thead')
	let tbody = document.createElement('tbody')
	table.append(thead)
	table.append(tbody)
	table.setAttribute('class', 'table table-bordered script-generated-table mtfnam')
  if( customHeaders.length==Object.keys(matrix[0]).length && customHeaders instanceof Array){
  	makeHeader(customHeaders,thead)
  }else{
  	customHeaders=Object.keys(matrix[0])
  	makeHeader(customHeaders,thead)
  }

  function makeHeader(headers,thead){
  	headers.forEach(function(column){
  		let th=document.createElement('th')
  		th.textContent=column
  		thead.append(th)
  	})
  	return thead
  }

	matrix.forEach(line=>{        
	  let tr=document.createElement('tr')
	  customHeaders.forEach(function(key){
	  	let cell=line[key]
	  	let td=document.createElement('td')
	  	td.textContent=cell
	  	tr.append(td)
	  })
	  tbody.append(tr)
	})

	return table
	
}
