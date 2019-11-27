$(document).ready(function(){
	//Get first column of each row
	let sequences=[]
	$('table tbody tr').each(function(index){
		let seq=$(this).children('td:nth(0)').val()
		console.log($(this).children('td:nth(0)'))
		sequences.push(seq)
	})
	var uniq = sequences.map((seq) => {
	    return {
	      count: 1,
	      name: seq
	    }
	  })
	  .reduce((a, b) => {
	    a[b.name] = (a[b.name] || 0) + b.count
	    return a
	  }, {})
	var duplicates = Object.keys(uniq).filter((a) => uniq[a] > 1)
	console.log(duplicates)

})