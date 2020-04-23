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
function convertRow2HTML(target,rows,header,metadata){
	target.html('')
	rows.forEach(function(row){
		let tr=document.createElement('tr')
		row.forEach(function(col){
			let el = header? document.createElement('th') : document.createElement('td')
			el.textContent=col
			tr.append(el)
		})
		target.append(tr)
	})
}
function populateTable(rows,table){
	let newTableTarget=table.find('tbody')
	convertRow2HTML(newTableTarget,rows)
}
function insertInEl(rows,table,element){
	let tableTarget=table.find(element)
	convertRow2HTML(tableTarget,rows)
}
function cloneTable(tableClass,targetTableClass){
	let targetTable=$(`table.${targetTableClass}`) //table selector
	let table=targetTable.clone()
	table.removeClass(targetTableClass).removeClass('invisible').addClass(tableClass) //table selector //arg1 dup
	targetTable.before(table)
	return table
}
function addHeader(table,header){
	let target=table.find('thead')
	convertRow2HTML(target,[header],true)
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

function startWebSocket(address,protocol,callBack){
  var ws = new WebSocket(address,protocol);
  ws.onopen = function () {
      console.log('socket connection opened properly');
  };
  ws.onmessage = function (evt) {
      callBack(evt.data)
      //console.log("Message received = " + evt.data);
      //event=JSON.parse(evt.data)
  };
  ws.onclose = function () {
       // websocket is closed.
      console.log("Connection closed...");
  };
}

function loadingPanel(){
  	if($('.loading-panel').length>0){
  		$('.loading-panel').toggle()
  	}else{
	  divTransparent=document.createElement('div');
	  div=document.createElement('div');
	  badge=document.createElement('span');
	  spinner=document.createElement('div');
	  span=document.createElement('span')
	  body=$('body')
	  divTransparent.className='loading-panel'
	  divTransparent.setAttribute('style',"width:100%;height:100%;position:fixed;top:0px;left:0px;background-color:#00000073")
	  spinner.className="spinner-border text-warning"
	  badge.className="badge badge-info"
	  badge.textContent=" Loading! Please wait... "
	  let top=window.innerHeight*0.50 || "200"
	  let left=window.innerWidth*0.50 || "200"
	  div.setAttribute('style',`position:fixed;top:${top}px;left:${left}px;`)
	  span.className="sr-only"
	  span.textContent="Loading..."

	  spinner.setAttribute("role","status")

	  body.append(divTransparent)
	  divTransparent.append(div)
	  div.append(badge)
	  badge.prepend(spinner)
	  spinner.append(span)
	}
}
