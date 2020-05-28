var result={
	"headers":[
		"keyInValue",
		"key2InValue",
		"etc."
	],
	"rows":{
		"AUGUATACAUACUA":{
			"metadata":{
				"row":[{"key":"value"}],
				"cell":[{"key":"value"}]
			},
			"values":{

			}
		}
	},
	"columns":{  //Tuples https://stackoverflow.com/questions/5199901/how-to-sort-an-associative-array-by-its-values-in-javascript
		colname:[
			["AUGUATACAUACUA","colValue"]
		]
	}
}
var getAssayDataWithAnnotations=require('./getAssayDataWithAnnotations')
var start=0
module.exports=function(options){
	return new Promise((res,rej)=>{
		getAssayDataWithAnnotations(options).then(data=>{
            start=new Date()  
			if (data instanceof Error ) rej(data)
			let assembledData=assembleRows(data.result.data) 
			res(assembledData)
		})
	})
}

function assembleRows(rows){
    let newRows={}
    let headers=buildHeader(rows)

	rows.forEach(row=>{
        if(!hasHeader(headers,row)){
          let header=row.header.assayName 	
          headers.headers[header]={value:header}  
        }
        if(hasSequence(newRows,row)){
          let header=row.header.assayName 
          newRows[row.group.Sequence].raw[header+"(raw)"]={
            value: row.grouping_attributes.raw,
            metadata: Object.assign({type:"raw"},row.metadata.cell)
          }
          newRows[row.group.Sequence].cpm[header+"(cpm)"]={
          	value: row.grouping_attributes.cpm,
          	metadata: Object.assign({type:"cpm"},row.metadata.cell)
          }
        }else{
          //if(row.attributes.row_attributes.targets.list.length>0) buildTargetHeader(headers,row)	
          newRows[row.group.Sequence]=buildNewRow(newRows,row)
        }
	})
    function finishHeaders(headers){
      Object.keys(headers.headers).forEach(header=>{
    	headers.cpm.push({value:header+"(cpm)",metadata:{id:"cpm",type:"cpm",section:"cpm"}})
    	headers.raw.push({value:header+"(raw)",metadata:{id:"raw",type:"raw",section:"raw"}})
      })
      delete headers.headers
    }
    finishHeaders(headers)
	end=new Date()
	runtime=end-start
	return {runtime,header:headers,rows:newRows}
}



function hasHeader(headers,row){
  let header=row.header.assayName 	
  if(row.header){
	if(row.header.assayName){
	  return headers.headers[header]!==undefined
	}else{
	  throw new Error("Missing key in Group Sequence")
	}            	
  }else{
	throw new Error("Missing key ")	
  }        	
}
function buildTargetHeader(headers,row){
  //TODO get target attributes and insert into header
}
function buildNewRow(rows,row){
  let header=row.header.assayName
  return{
	raw:{
		[header+"(raw)"]:{
		  value: row.grouping_attributes.raw,
		  metadata: Object.assign({type:"raw"},row.metadata.cell)
		}
	},
	cpm:{
		[header+"(cpm)"]:{
		  value: row.grouping_attributes.cpm,
		  metadata: Object.assign({type:"cpm"},row.metadata.cell)
		}
	},          	
	row_attributes:buildRowAttributes(row.attributes.row_attributes),
	//The targets list might not be ok
	targets:{
		list:{
			value:row.attributes.targets.list,
			metadata:Object.assign({header:"list"},row.metadata.row)
		}
	}
  }
  function buildRowAttributes(row_attributes){
	let result={}
	Object.keys(row_attributes).forEach(attribute=>{
	  result[attribute]={
		  value:row_attributes[attribute],
		  metadata:Object.assign({header:"list"},row.metadata.row)
		}
	})
	return result
  }      
}
function hasSequence(rows,row){
  if(row.group){
	if(row.group.Sequence){
	  return rows[row.group.Sequence]!==undefined
	}else{
	  throw new Error("Missing key in Group Sequence")
	}            	
  }else{
	  throw new Error("Missing key ")	
  }
}
function buildHeader(rows){
  let row=rows[0]
  if(row.attributes){
	if(row.attributes.row_attributes){
      return {
		headers:{}, //Remove once finished
		raw:[], //This have to be converted to an array in the end
		cpm:[], //This array has to be converted into an array
		row_attributes:rowAttributes(row),
		targets:[{
		  value:"list",
		  metadata:{
			id:"list",
			section:"targets"
		  }	
	    }]
      }
	}else{
	  throw new Error('missing row_attributes in key row.attributes')
	}
  }else{
	throw new Error('missing attributes in key row')
  }
  //TODO this is not finished! If targets are found in some new sequence. Target is specific to the row so a new row will have a target for all libs.
  //target_accession:{_table:"Transcript",_attribute:"accession"},
  //target_description:"",
  //type:"",
  //expectation:""
  function rowAttributes(row){
	let result=[]
	Object.keys(row.attributes.row_attributes).forEach(key=>{
	  result.push({
		value:key,
		metadata:{
		  id:key,
		  section:"row_attributes"
		}
	  })
	})
	return result
  }
}
