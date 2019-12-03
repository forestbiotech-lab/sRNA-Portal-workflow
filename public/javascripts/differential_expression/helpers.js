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
function convertRow2HTML(rows,header){
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
	//rows.appendTo(newTableTarget) //selector on main table //This one uses id while the other used a new attribute
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
