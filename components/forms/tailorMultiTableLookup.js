const getSpecifiedTables=require('./../miRNADB/controllers/getSpecifiedTables')


//Authentication table are on another database to avoid problems with this.
const exclusiontables=[""]
const exclusionAttributes=[""]



module.exports=function(sourceTable,tableConnections,callOutputStructure){
  if(verifyArgumentTypes(sourceTable,tableConnections,callOutputStructure) &&verifyAttributes(callOutputStructure) && verifyRequestTables(sourceTable,tableConnections) ){
    return getSpecifiedTables(sourceTable,tableConnections,callOutputStructure)
  }else{
    if(verifyArgumentTypes(sourceTable,tableConnections,callOutputStructure))
      throw Error("One of the input arguments is missing or invalid type. Requested args (3) args types: (Str,Array,Object)")
    else 
      throw Error("Some of the necessary conditions to perform this query were not verified! forms/tailorMultiTableLookup.js")
  }
}





function verifyRequestTables(sourceTable,tableConnections){
  return true
}
function verifyAttributes(callOutputStructure){
 return true
}
function verifyArgumentTypes(sourceTable,tableConnections,callOutputStructure){
  isSourceTableCorrect=false
  isTableConnectionsCorrect=false
  isCallOutputStructureCorrect=false
  if(typeof sourceTable=="string") isSourceTableCorrect=true
  if( tableConnections instanceof Object) isTableConnectionsCorrect=true
  if( callOutputStructure instanceof Object) isCallOutputStructureCorrect=true
  return isSourceTableCorrect && isTableConnectionsCorrect && isCallOutputStructureCorrect
}

