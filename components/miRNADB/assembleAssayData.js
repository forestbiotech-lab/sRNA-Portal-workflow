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

module.exports=function(options){
	return new Promise((res,rej)=>{
		getAssayDataWithAnnotations(options).then(data=>{
			if (data instanceof Error ) rej(data)
			let assembledData=assembleRows(data.result.data) 
			res(assembledData)
		})
	})
}

function assembleRows(rows){
	let matrix={header:[],rows:{},metadata:{row:[],cell:[]}}
	let result={}
	let resultHeaders=""
	let resultMetaCell=""
	let resultAttributes={}
	let attributes={}
	let headers=[]
	let metaCell=[]	
	rows.forEach(row=>{
		let groupingElement={key:"",value:""}
		let values=[]
		let digest=digestDBRow(row,headers,groupingElement,attributes,metaCell,values)
		headers=digest.headers
		groupingElement=digest.groupingElement
		attributes=digest.attributes
		metaCell=digest.metaCell
		values=digest.values
		//Row processed
		groupedRows=groupRows(values,groupingElement,result,attributes,headers,metaCell,resultMetaCell) 
		groupingElement=groupedRows.groupingElement
		result=groupedRows.result
		attributes=groupedRows.attributes
		headers=groupedRows.headers
		metaCell=groupedRows.metaCell
		resultMetaCell=groupedRows.resultMetaCell
		//this only apllies for single row iterations. i.e. one row per iter.
		if(matrix.header.length==0){
			resultHeaders=headers
		}
		resultMetaCell=metaCell
		resultAttributes=attributes
	})

	//bring together all arrays
	matrix=buildMatrix(result,resultMetaCell,resultHeaders,matrix)
	return matrix
}


function digestDBRow(row,headers,groupingElement,attributes,metaCell,values){	
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
		}else if ( key == "attributes"){
			attributes=value
		}else if( key == "metadata" ){
			if(value["cell"]){
				metaCell.push(value.cell)
			}else{
				throw "Matrix metadata not found for column"
			}
		}else{
			values.push({key:key,value:value})
		}
	})
 return {headers,groupingElement,attributes,metaCell,values}	
}

function groupRows(values,groupingElement,result,attributes,headers,metaCell,resultMetaCell){
	values.forEach(val=>{
		cKey=val.key
		cValue=val.value
		gValue=groupingElement.value
		if(result[gValue]){
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
			}
		}
	})	
	return {groupingElement,result,attributes,headers,metaCell,resultMetaCell}	
} 

function buildMatrix(result,resultMetaCell,resultHeaders,matrix){	
	Object.keys(result).forEach(seq=>{
		let row={}
		let headers=[]
		let cellMeta=[]
		seqData=result[seq]
		Object.keys(seqData).forEach(attrKey=>{
			if(seqData[attrKey].length==1){ //attributes
				row[attrKey]={value:seqData[attrKey],metadata:resultMetaCell[index]}
				headers.push(attrKey)
			}else{ 
				seqData[attrKey].forEach((val,index)=>{
					row[`${resultHeaders[index].value}(${attrKey})`]={value:val,metadata:resultMetaCell[index]}
					headers.push(`${resultHeaders[index].value}(${attrKey})`)					
				})
			}

		})
		matrix.rows[seq]=row
		if (matrix.header.length==0){
			matrix.header.push(headers)
		}
	})
	return matrix
}