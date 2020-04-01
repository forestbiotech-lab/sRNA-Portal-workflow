var killList={}
$(document).ready(function(){
  let uploadMatrix=[]
  let loadedRows=0
  let filename=$('.card.upload-table table.upload-table tr#lastRow').attr('filename')
  const rowsPerIter=100
  let iteration=0
  let fulltable=false
  let viewPortHeight=window.innerHeight
  let lastRow = null
  let uploadNumber=0

  loadingPanel()  

  if(filename)if(filename.length>0){
    
    getMatrixObj({filename,studyId,responseType:'json'}).then(function(data){
      uploadMatrix=data
      lastRow=document.getElementById("lastRow");
      loadedRows=$('.card.upload-table table.upload-table tbody tr').length-2
      loadConflicts(uploadMatrix)
      addUploadNumber(Object.keys(data.hashLookup).length)
      loadRows()
    },rej=>{
      console.error(`Promise rejected! - ${rej}`)
    }).catch(function(err){
      alert(err)
    })
  }


  function getMatrixObj(data){
    return new Promise(function(res,rej){
      $.ajax({
        url:"/de/uploaded-file",
        type: 'POST',
        data: data,
        dataType: 'json',
        success: function(dataRes,textStatus,jqXHR){  
          dataRes.studyId=$('.card.gen-info span.badge#studyId').text()
          varListener.a = dataRes
          passFileStructure()
          res(dataRes)
        },error:function(qXHR,textStatus,err){
          let response=qXHR.responseJSON
          response.type=response.type || null
          if(response.type=="QualityControl"){
            processErrorGetMatrix(response)
          }
          loadingPanel()
          rej(err)
        }
      })    
    })
  }

  function passFileStructure(){
    let invalidStructure=$(`.card.gen-info .card-header.study .card-body ul.InvalidStructure span.glyphicon`)
    let conflicts=$(`.card.conflicts`)
    setIconApproved(invalidStructure)
    conflicts.removeClass('d-none')
  }
  function processErrorGetMatrix(err){
    let name=err.name
    let message=err.msg
    let alert=$(`.card.gen-info .card-header .card-body ul.${name} .alert.err-msg`)
    $(`.card.gen-info .card-header .card-body.quality-screening a.go-back`).removeClass('d-none')
    alert.text(message)
    alert.removeClass('d-none')
  }
  function setConfictSolved(elementClass){
    let icon=$(`.card.gen-info .card-header .card-body.quality-screening ul.${elementClass} span.glyphicon`)
    let msg=$(`.card.gen-info .card-header .card-body.quality-screening ul.${elementClass} .alert`)
    msg.addClass('d-none')
    setIconApproved(icon)
    if(allConflictsSolved()){
      //TODO
      $('.card.conflicts .card-body.conflicts-general-warning').addClass('d-none')
      $('.card.upload-table').removeClass('d-none')    
    }
  }
  function setIconApproved(icon){
    icon.removeClass('glyphicon-remove').addClass('glyphicon-ok').css('color','green')
  }
  function allConflictsSolved(){
    return $(`.card.gen-info .card-body.quality-screening ul span.glyphicon.glyphicon-remove`).length==0
  }

  function loadConflicts(uploadMatrix){
    let numDuplicateSequences=uploadMatrix.duplicateSeq.length
    let numDuplicateRows=uploadMatrix.duplicateHashes.length
    let numberOfConflicts=numDuplicateSequences+numDuplicateRows
    if(numberOfConflicts>0){
      addConflictsNumber(numberOfConflicts)
      if(numDuplicateRows>0){
        processErrorGetMatrix({name:"DuplicateRows",msg:`please solve ${numDuplicateRows} duplicate rows shown below before proceding!`})
        addDuplicateRowsNumber(numDuplicateRows)
        loadDuplicates(uploadMatrix,domID="duplicate-rows",duplicateList="duplicateHashes",lookupList="hashLookup")
        $('.card.conflicts .card-header.duplicate-rows button.remove-duplicate-rows').click(function(){
          let that=$(this)
          that.addClass('d-none')
          that.next('a.go-back').addClass('d-none')
          that.closest('.card-header.duplicate-rows').next('.card-body.duplicate-rows').addClass('d-none')
          addDuplicateRowsNumber(0)
          addConflictsNumber(getConflictsNumber()-numDuplicateRows)
          setConfictSolved("DuplicateRows")
        })

      }else{
        setConfictSolved("DuplicateRows")
      }
      if(numDuplicateSequences>0){
        addDuplicateSequencesNumber(numDuplicateSequences)
        loadDuplicates(uploadMatrix,domID="duplicate-sequences",duplicateList="duplicateSeq",lookupList="seqLookup")
        processErrorGetMatrix({name:"DuplicateSequences",msg:`please solve ${getDuplicateSequencesNumber()} duplicate sequences shown below before proceding!`})
        $('.card.conflicts .card-body.duplicate-sequences table').each(function(){
          let that=$(this)
          let buttonTarget=that.find('th:nth(0)')
          let merge=makeButton({text:"merge",icon:"resize-small"},'btn btn-primary',{evt:'click',callback:mergeRows})
          buttonTarget.append(merge)    
          that.find('tr').each(function(index){
            let row=$(this)
            let td=document.createElement('td')
            if(index>0){
              let del=makeButton({text:"",icon:"remove"},'btn btn-sm btn-danger',{evt:'click',callback:removeRow})
              td.append(del)
            }
            row.prepend(td)
          })
        }) 
        //TODO show table with sequences
      }else{
        setConfictSolved("DuplicateSequences")
      }
    }else{
      setConfictSolved("DuplicateRows")
      setConfictSolved("DuplicateSequences")
    }
    loadingPanel()
  }

  function mergeRows(){
    let clickedButton=$(this)
    let table=clickedButton.closest('table')
    let rows=table.find('tbody tr')
    let newRow=[]
    let refRow=rows[0]
    for(index in refRow.cells){  
      if(index==1){  //0:button 1:sequence
        newRow.push(rows[0].cells[index].textContent)
      }
      if(index==2){ //annotation
        newRow.push(mergeAnnotations(index,rows))
      }
      if(index>2){
        if(equalCells(index,rows)){
          newRow.push(rows[0].cells[index].textContent)
        }else{
          //TODO //sum rows
        }  
      } 
    }
     
    removeAllBodyRows(table)
    mergedActions(table,newRow)
    insertInEl([newRow],table,'tbody')

  }

  function removeAllBodyRows(table){
    table.find('tbody').empty()
  }

  function mergeAnnotations(index,rows){
    let annotations=[]
    rows.each(function(){
      let row=$(this)[0]
      let rowAnnotation=row.cells[index].textContent.trim()
      if(annotations.indexOf(rowAnnotation)==-1){
        annotations.push(rowAnnotation)
      }
    })
    let mergedAnnotations=""
    annotations.forEach((annotation)=>{
      mergedAnnotations+=annotation+"-"
    })

    return mergedAnnotations.replace(/-$/,"")
  }

  function equalCells(index,rows){
    let reference=rows[0].cells[index].textContent.trim()
    rows.each(function(){
      let rowValue=$(this)[0].cells[index].textContent.trim()
      if(reference!=rowValue){
        return false
      }
    })
    return true
  }

  function removeRow(){
    let clickedButton=$(this)
    let table=clickedButton.closest('table')
    let tbody=table.find('tbody')
    let row=clickedButton.closest('tr')
    row.remove()

    if(numberOfRows(tbody)==1){
      let tr=tbody.find('tr')
      let newRow=convertTrToArray(tr)
      mergedActions(table,newRow)
    }
    function numberOfRows(tbody){
      return tbody.find('tr').length
    }

  }
  function mergedActions(table,row){
    let numDuplicateSequencesConflicts=getDuplicateSequencesNumber()-1
    removeButtons(table)
    addSequenceToKillList(rows=[row],conflictType="duplicate-sequences")
    addDuplicateSequencesNumber(numDuplicateSequencesConflicts)
    addConflictsNumber(getConflictsNumber()-1)
    
    if(numDuplicateSequencesConflicts<=0){
      let viewButton=makeButton({text:" toggle tables",icon:"eye-open"},'btn btn-primary',{evt:'click',callback:function(){
        $('.card.conflicts .card-body.duplicate-sequences').slideToggle('slow')  
      }})
      $('.card.conflicts .card-header.duplicate-sequences .card-title').append(viewButton) //add view button
      $('.card.conflicts .card-body.duplicate-sequences').slideToggle('slow')
      setConfictSolved("DuplicateSequences")
    }

    function removeButtons(table){
      let thead=table.find('thead')
      let tbody=table.find('tbody')
      thead.find('td').remove()  // remove precedding td in table header
      thead.find('th:nth(0)').empty() //remove merge
      tbody.find('tr td:nth(0)').remove()
    }
  }



  function convertTrToArray(tr){
    rowData=[]
    tr.children('td').each(function(){
      rowData.push($(this).text().trim())
    })
    return rowData
  }

  function loadDuplicates(uploadMatrix,domID,duplicateList,lookupList){
    let table=$(`.card.conflicts .card-body.${domID} table.${domID}`) //duplicate-rows
    uploadMatrix[duplicateList].forEach(duplicateElement=>{
      if(domID=="duplicate-sequences"){
       if(duplicateElement in killList){
         //TODO subtract value from conflicts
         addDuplicateSequencesNumber(getDuplicateSequencesNumber()-1)
         addConflictsNumber(getConflictsNumber()-1)
       }else{
        makeDuplicateTable(table,uploadMatrix,domID,lookupList,duplicateElement) 
       } 
      }else{
        makeDuplicateTable(table,uploadMatrix,domID,lookupList,duplicateElement)
      }
    })
    function makeDuplicateTable(table,uploadMatrix,domID,lookupList,duplicateElement){
      let newTable=table.clone()
      newTable.insertAfter(table)
      addHeader(newTable,uploadMatrix.header)
      let rows=[]
      uploadMatrix[lookupList][duplicateElement].forEach(row=>{
        rows.push(row)
      })
      addSequenceToKillList(rows,domID)
      insertInEl(rows,newTable,'tbody')
    }    
  }




  function addSequenceToKillList(rows,conflictType){
    let sequence=rows[0][0].trim()
    let type=conflictType=="duplicate-sequences" ? "merge" : "duplicate"
    let substitute=conflictType=="duplicate-sequences" ? rows[0] : ""
    killList[sequence]={type,substitute}
  }

  function loadRows(){
    let start=iteration*rowsPerIter
    let hashes=Object.keys(uploadMatrix.hashLookup).slice(start,start+rowsPerIter)
    let rows=[]
    hashes.forEach(function(hash){
      let row=uploadMatrix.hashLookup[hash]
      if (row.length == 1)
        if( uploadMatrix.duplicateSeq.indexOf( row[0][0] ) ==-1 )
          rows.push(row[0])
    })            
    table=$('.card.upload-table table.upload-table')
    if(iteration==0){
      addHeader(table,uploadMatrix.header)
      let colspan=uploadMatrix.header.length
      $('.card.upload-table table.upload-table tr#lastRow td').attr('colspan',colspan)
    }
    insertInEl(rows,table,'tbody')
    $('.card.upload-table table.upload-table tr#lastRow').appendTo('.card.upload-table table.upload-table tbody')
    addLoadedRows(rows.length)
    iteration++
    if(loadedRows>=uploadNumber) fulltable=true
  }


  function addLoadedRows(value){
    loadedRows+=value
    $('.card.upload-table .card.upload-table .badge#ofLoadedRows').text(loadedRows)
  }
  function addUploadNumber(value){
    uploadNumber=value
    $('.card.upload-table .card.upload-table .badge#ofUploadSequences').text(value)
  } 
  function addConflictsNumber(value){
    let badge=$('.card.conflicts .card-header.conflicts .badge#ofConflicts')
    badge.text(value)
    if(value==0){
      setSuccessBadge(badge)
    }
  }
  function getConflictsNumber(){
    let badge=$('.card.conflicts .card-header.conflicts .badge#ofConflicts')
    return parseInt(badge.text())
  } 
  function addDuplicateRowsNumber(value){
    let badge=$('.card.conflicts .card-header.duplicate-rows .badge#ofDuplicateRows')
    badge.text(value)
    if(value==0){
      setSuccessBadge(badge)
    }
  } 
  function addDuplicateSequencesNumber(value){
    let badge=$('.card.conflicts .card-header.duplicate-sequences .badge#ofDuplicateSequences')
    badge.text(value)
    if(value==0){
      setSuccessBadge(badge)
    }
  }
  function getDuplicateSequencesNumber(){
    let badge=$('.card.conflicts .card-header.duplicate-sequences .badge#ofDuplicateSequences')
    return parseInt(badge.text())
  }
  function setSuccessBadge(badge){
    badge.removeClass('badge-primary').addClass('badge-success')
  }

  window.onscroll = function(){ 
    if(iteration>=1){
      var distanceFromTop=lastRow.getBoundingClientRect().top
      var relElDistance= ( distanceFromTop - viewPortHeight ) / viewPortHeight 
      if ( relElDistance <= 0.05 && ! fulltable ) loadRows()  
    }
  }
  $(window).on('resize',function(){
    viewPortHeight=window.innerHeight

  })


/*Test if useful 
  class Header extends Table{
    generateHeader(sectionOrder){
        this.genHeader(sectionOrder,this)
    }
    genHeader(sectionOrder,that){
      var colGroup=document.createElement('colgroup')
      var rowElement=document.createElement('tr')
      var topRowElement=document.createElement('tr')
      sectionOrder.forEach(function(section){
        let topCell=document.createElement('th')
        that.section(section).forEach(header=>{
          let cell=document.createElement('th')
          let col=document.createElement('col')
          cell.textContent=header.value
          Object.keys(header.metadata).forEach(key=>{
            let value=header.metadata[key] 
            cell.setAttribute(key,value)
            col.setAttribute(key,value)
            topCell.setAttribute(key,value)
          })
          rowElement.append(cell)
          colGroup.append(col)
        })
        topCell.textContent=section
        topCell.setAttribute("colspan", that.section(section).length)
        topRowElement.append(topCell)
      })
      that.jqTable.find('thead').html(colGroup)
      that.jqTable.find('thead').append(topRowElement)
      that.jqTable.find('thead').append(rowElement)
    }
  }
  class Body extends Table{
    rowFraction(iteration,rowsPerIter){
      let start=iteration*rowsPerIter
      let sequences=Object.keys(this.rows).slice(start,start+rowsPerIter)
      let rows=[]
      sequences.forEach(seq=>{
        rows.push(this.rows[seq])
      })
      return rows
    }
    get totalRows(){
      return Object.keys(this.rows).length
    }
    get rows(){
      return this._rows
    }
    set rows(rows){
      this._rows=rows
    }
    get rowNameList(){
      return Object.keys(this.rows)
    }
    set rowsPerIter(rows){
      this.rowsPerIteration=rows
    }
    createAndInsertRows(iteration,search){
      search=search || false
      this.appendRows(iteration,search)
      this.jqTable.find('tbody').append(this.jsLastRow)
    }
    createSpecificRows(rows,search){
      rows.forEach(row=>{
        this.jqTable.find('tbody').append(this.createRow(row,search))
      })
    }
    appendRows(iteration,search){
      this.rowFraction(iteration, this.rowsPerIteration).forEach(row=>{
        this.jqTable.find('tbody').append(this.createRow(row,search))
      })
    }
  }
  //END test

*/



})