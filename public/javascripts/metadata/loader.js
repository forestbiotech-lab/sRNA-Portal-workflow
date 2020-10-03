$(document).ready(function(){
  loadSequence()
  loadAssociatedStudies()


  function loadAssociatedStudies(){
    let sequenceId=getSequenceId()
    if(sequenceId!=-1){
      getAssociatedstudies(sequenceId)
      ///TODO with the result
    }
  }

  function loadSequence(){
    let sequenceId=getSequenceId()
    if(sequenceId!=-1){
      let sequenceDOM=$('input.sequence')
      getSequence(sequenceId,placeSequence)
      function placeSequence(sequence){
        sequenceDOM.val(sequence)
      }
    }
  }
  
  function getSequence(id,placeSequence){
    $.ajax({
      url:`/forms/factory/fromTable/byId/Mature_miRNA_sequence/${id}`,
      success:function(data,textStatus,jqXHR){
        try{
          let sequence=data.sequence
          placeSequence(sequence)  
        }catch(err){
          console.log(err)
          placeSequence("N/A")  
          displayToast("Loading Error!","Sequence not found in database",4000)  
        }
      },
      error:function(jqXHR,textStatus,error){
        displayToast("Loading Error!",error,4000)
      }
    })
  }
  function getSequenceId(){
    try{
      let sequenceDOM=$('input.sequence')
      if(sequenceDOM.length==1){
        return sequenceDOM.attr('sequence-id')
      }      
    }catch(err){
      return -1
    }
  }
  function getAssociatedstudies(seqId){
    let callOutputStructure={
      id:"",
      sequence:"",
      accession:{_table:'Mature_miRNA',_attribute:"accession"},
      Study:{
        _table:['Mature_miRNA','Annotation','Assay_datum',"Assay"],
        id:{_table:"Study",_attribute:"id"},
        title:{_table:"Study",_attribute:"title"},
        Assays:[{
          _table:"Assay",
          _model:{
            _table:"Assay",
            "id":"",
            "name":""
          }
        }]
      }
    }
    let tableConnections={
      "Mature_miRNA":{
        "Annotation":{
          "Assay_data":{
            "Assay":{
              Study:"" 
            }
          }
        }  
      },
      where:{id:seqId}
    }
    tailoredTableQuery("Mature_miRNA_sequence",tableConnections,callOutputStructure,success,error)
    function success(data){
      makeStudiesTable(data)      
    }
    function error(error){
      displayToast("Error",error,4000)
    }
    /**
        @param {object}       attribtues  Tr attributes
        @param {array}        contents    Cell contents
        @param {array/object} metadata    cell attributes
        @param {boolean}      header      optional, idicates wheather this row is a header or not.
        **/
      
    function makeStudiesTable(data){
      data.data.forEach((row,index)=>{
        let associatedStudiesTable=$('table.associated-studies')
        let study=Object.assign({},row.Study)
        let assayTable=makeAssayTable(study.Assays,index)
        associatedStudiesTable.after(assayTable)
        
        study.Assays=makeButton(
          {text:study.Assays.length},
          {class:"btn btn-success","study-row":index},
          {evt:"click",callback:makeAssayTableModal}
        )
        associatedStudiesTable.append(makeRow(trAttributes={},study,metadata={},header=false))          
      })
      function makeAssayTable(assays,index){  
        let table=mkel("table",{class:"table assay-table d-none","study-row":index})
        let header=makeRow(trAttributes={},Object.keys(assays[0]),{},true)
        table.append(header)
        assays.forEach(assay=>{
          table.append(makeRow(trAttributes={},assay,{}))
        })  
        return table
      }
      function makeAssayTableModal(){
        let studyRow=$(this).attr('study-row')
        let assayTable=$(`table.assay-table[study-row|=${studyRow}]`).clone()
        assayTable.removeClass('d-none')
        assayTable=assayTable[0]
        makeModal("Assays",assayTable)
      }
    }

      

  }
  function getAssociatedAssaysInStudy(studyId){
    // 
  }
  function getAssayCountForStudy(studyId){

  }
  function tailoredTableQuery(sourceTable,tableConnections,callOutputStructure,success,error){
    let data={
      sourceTable,
      tableConnections,
      callOutputStructure
    }
    $.ajax({
      method:"POST",
      url:"/forms/factory/tailored-query/",
      data,
      success:(data,textStatus,jqXHR)=>{
        if(success) success(data)
      },
      error:(jqXHR,textStatus,err)=>{
        console.log(err)  
        if(error)error(err)        
      }
    })
  }

})