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
	let matrix={header:[],rows:{},metadata:{row:[],cell:[]}}
	let result={}
	let resultHeaders=[]
	let resultMetaCell=""
	let resultMetaRow=""
	let resultAttributes={}
	let attributes={}
	let headers=[]
	let metaCell=[]	
	let metaRow=[]
  
    let newRows={}
    let newHeaders=buildHeader(rows)

	rows.forEach(row=>{
        if(!hasHeader(newHeaders,row)){
          let header=row.header.assayName 	
          newHeaders.headers[header]={value:header}  
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
  
        

		let groupingElement={key:"",value:""}
		let values=[]
		let digest=digestDBRow(row,headers,groupingElement,attributes,metaCell,metaRow,values)
		headers=digest.headers
		groupingElement=digest.groupingElement
		attributes=digest.attributes
		metaCell=digest.metaCell
		metaRow=digest.metaRow
		values=digest.values
		//Row processed
		groupedRows=groupRows(values,groupingElement,result,attributes,headers,metaCell,metaRow,resultMetaCell,resultMetaRow) 
		groupingElement=groupedRows.groupingElement
		result=groupedRows.result
		attributes=groupedRows.attributes
		headers=groupedRows.headers
		metaCell=groupedRows.metaCell
		metaRow=groupedRows.metaRow
		resultMetaCell=groupedRows.resultMetaCell
		//this only apllies for single row iterations. i.e. one row per iter.
		if(matrix.header.length==0){
			resultHeaders=headers
		}
		resultMetaCell=metaCell
		resultMetaRow=metaRow
		resultAttributes=attributes
	})
    function finishHeaders(headers){
      Object.keys(headers.headers).forEach(header=>{
    	headers.cpm.push({value:header+"(cpm)",metadata:{id:"cpm",type:"cpm",section:"cpm"}})
    	headers.raw.push({value:header+"(raw)",metadata:{id:"raw",type:"raw",section:"raw"}})
      })
      delete headers.headers
    }
    finishHeaders(newHeaders)
	//bring together all arrays
	matrix=buildMatrix(result,resultMetaCell,resultMetaRow,resultHeaders,matrix)
	end=new Date()
	runtime=end-start
	//return matrix
	return {runtime,header:newHeaders,rows:newRows}
}


function digestDBRow(row,headers,groupingElement,attributes,metaCell,metaRow,values){	
	Object.keys(row).forEach(key=>{
		let value=row[key] || 0
		let subKeys=Object.keys(value)
		let subKey=""
		//process Keys
		if( subKeys.length==1){
			subKey=subKeys[0]
			subValue=value[subKey]
		}
		if( key == "group" ){
			groupingElement={key:subKey,value:subValue}
		}else if( key == "header"){
			headers.push({key:subKey,value:subValue})
			//headers[subValue]={key:subKey,value:subValue}
		}else if ( key == "attributes"){
			attributes=value
		}else if( key == "metadata" ){
			if( value["cell"] && value['row'] ){ // Separate these this looks bad
				metaCell.push(value.cell)
				metaRow.push(value.row)
			}else{
				throw Error("Matrix metadata not found for column")
			}
		}else if ( key == 'grouping_attributes'){
			subKeys.forEach(function(subkey){
				subvalue=value[subkey]
				values.push({key:subkey,value:subvalue})
			})
		}
	})
 return {headers,groupingElement,attributes,metaCell,metaRow,values}	
}

function groupRows(values,groupingElement,result,attributes,headers,metaCell,metaRow,resultMetaCell,resultMetaRow){
	values.forEach(val=>{
		cKey=val.key
		cValue=val.value
		gValue=groupingElement.value
		if(result[gValue]){ //if the grouping value exists in the result Object
			if(result[gValue][cKey])
				result[gValue][cKey].push(cValue)
			else
				result[gValue][cKey]=[cValue]
		}else{
			result[gValue]={}
			result[gValue][cKey]=[cValue]
			Object.keys(attributes).forEach(attrKey=>{
				result[gValue][attrKey]=[attributes[attrKey]]
			})
			resultAttributes=attributes
			if(headers.length>1){ //so the first entry doesn't enter
				resultHeaders=headers
				headers=[resultHeaders.pop()]
				resultMetaCell=metaCell
				metaCell=[resultMetaCell.pop()]
				resultMetaRow=metaRow
				metaRow=[resultMetaRow.pop()]
			}
		}
	})	
	return {groupingElement,result,attributes,headers,metaCell,metaRow,resultMetaCell,resultMetaRow}	
} 

function buildMatrix(result,resultMetaCell,resultMetaRow,resultHeaders,matrix){	
	Object.keys(result).forEach(seq=>{
		let row={}
		let headers={}
		let cellMeta=[]   // Remove not used
		seqData=result[seq]
		Object.keys(seqData).forEach(seqDataAttrKey=>{
			let seqDataAttribute=seqData[seqDataAttrKey]
			if(seqDataAttribute.length==1){ //non grouped attributes
				row[seqDataAttrKey]={}
				headers[seqDataAttrKey]=[]
				Object.keys(seqDataAttribute[0]).forEach(function(attrKey){
					resultMetaRow[0].header=attrKey //add the header
				  row[seqDataAttrKey][attrKey]={value:seqDataAttribute[0][attrKey],metadata:resultMetaRow[0]}
					headers[seqDataAttrKey].push({value:attrKey,metadata:{id:attrKey,section:seqDataAttrKey}})
			  })
			}else{ 
			  let metadata=resultMetaCell.map((v,i)=>{return Object.assign({type:seqDataAttrKey},v)})
				row[seqDataAttrKey]={}
				headers[seqDataAttrKey]=[]
				seqDataAttribute.forEach((val,index)=>{
					let headername=`${resultHeaders[index].value}(${seqDataAttrKey})`
					row[seqDataAttrKey][headername]={value:val,metadata:metadata[index]}
					headers[seqDataAttrKey].push({
						value:`${resultHeaders[index].value}(${seqDataAttrKey})`,
						metadata:{
							id:seqDataAttrKey,
							type:seqDataAttrKey,
							section:seqDataAttrKey
						}
					})					
				})
			}
		})
		matrix.rows[seq]=row
		if (matrix.header.length==0){
			matrix.header=headers
		}
	})
	return matrix
}

function buildHeader(rows){
  let row=rows[0]
  if(row.attributes){
	if(row.attributes.row_attributes){
		//todo something
	}else{
	  throw new Error('missing row_attributes in key row.attributes')
	}
  }else{
	throw new Error('missing attributes in key row')
  }
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
	//TODO this is not finished! If targets are found in some new sequence. Target is specific to the row so a new row will have a target for all libs.
	//target_accession:{_table:"Transcript",_attribute:"accession"},
	//target_description:"",
	//type:"",
	//expectation:""
  }
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
