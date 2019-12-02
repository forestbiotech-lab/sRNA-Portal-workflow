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