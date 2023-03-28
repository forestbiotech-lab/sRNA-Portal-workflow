// This is the infinityLoader for api calls
$(document).ready(function(){
  let loadedRows=0
  let api=$('.card.gen-info').attr('api')
  const rowsPerIter=10
  let iteration=0
  let fulltable=false
  let viewPortHeight=window.innerHeight
  let uploadNumber=0
  let headerSpan=0
  let header=null
  let body=null

  //Gerate a view that allows configurate of these attributes
  let jqTable=$('table.upload-table')
  let sectionOrder=["row_attributes","raw","cpm","targets"]
  let hiddenColumns="cpm"
    
  $('.card.upload-table .card-header input#sequence-values-type').change(function(){
    let that=$(this)
    let option=that.prop('checked')
    options=["raw","cpm"]
    if(option){
      hiddenColumns=options[0]
    }else{
      hiddenColumns=options[1]
    }
    hideColumns()
  })
  $('.card.upload-table .card-header button.search').click(function(){
    let sequence=$(this).closest('.form-inline').children('input').val()
    body.jqTable.find('tbody tr[datatype|="search-result"]').remove()
    body.jqTable.find('tbody tr').hide()
    let rows=[]
    rows.push(body.rows[sequence])
    body.createSpecificRows(rows,search=true)
  })
  $('.card.upload-table .card-header button.clear').click(function(){
    body.jqTable.find('tbody tr[datatype|="search-result"]').remove()
    body.jqTable.find('tbody tr').show()
  })
  let apiNO=undefined
  //Specific 
  if(apiNO){
    let apiInfo=$('.card.gen-info')
    let call=apiInfo.attr("call")
    let version=apiInfo.attr("version")
    let studyId=apiInfo.attr("studyId")
    url=`/de/assaydata/${studyId}/matrix`
    getMatrixObj(url).then(function(data){
      header=new Header(data.header,data.rows,jqTable)
      body=new Body(data.header,data.rows,jqTable)

      loadedRows=body.loadedRows
      addUploadNumber(body.totalRows)
      
      function loadSequenceTypeAhead(){
        $('.typeahead').typeahead({ 
          source:body.rowNameList,
          autoSelect:true
        }); 
      }

      loadSequenceTypeAhead()
      header.generateHeader(sectionOrder)
      header.lastRowTd.attr('colspan',header.columns)
      body.rowsPerIter=rowsPerIter    
      loadRows()
      jqTable.trigger('loadedAssayData')
    }).catch(function(err){
      console.trace(err)
      alert(err)
    })
  }



/////////////////////////////////////////////Generic////////////////////
  function getMatrixObj(url){
    return new Promise(function(res,rej){
      $.ajax({
        url:url,
        type: 'GET',
        dataType: 'json',
        success: function(dataRes,textStatus,jqXHR){  
          res(dataRes)
        },error:function(qXHR,textStatus,err){
          console.log(err)
          rej(err)
        }
      })    
    })
  }


  function loadRows(){
    body.createAndInsertRows(iteration)
    addLoadedRows(body.loadedRows)
    iteration++
    if(loadedRows>=uploadNumber){
      fulltable=true
      body.jqLastRow.hide()
    } 
    hideColumns()
  }
  function addLoadedRows(value){
    loadedRows=value
    $('.card.upload-table .badge#ofLoadedRows').text(loadedRows)
  }
  function addUploadNumber(value){
    uploadNumber=value
    $('.card.upload-table .badge#ofUploadSequences').text(value)
  } 


  window.onscroll = function(){ 
    if(iteration>=1){
      var distanceFromTop=body.jsLastRow.getBoundingClientRect().top
      var relElDistance= ( distanceFromTop - viewPortHeight ) / viewPortHeight 
      if ( relElDistance <= 0.05 && ! fulltable ) loadRows()  
    }
  }
  $(window).on('resize',function(){
    viewPortHeight=window.innerHeight
  })

  function hideColumns(){
    $(`table th`).show()
    $(`table td`).show()
    $(`table th[type|="${hiddenColumns}"]`).hide()
    $(`table td[type|="${hiddenColumns}"]`).hide()
  }
  class Table{
    constructor(headers,rows,jqTable){
      this.rows=rows
      this.jqTable=jqTable
      this.rowsPerIteration=10
      this.headers=headers
      this._currentHeaders=null
      if( headers instanceof Object){
        let sections=Object.keys(this.headers)
        this.columns=sections.reduce((a,cv)=>{
          if( typeof a == "number" ){
              return a+headers[cv].length           
          }else{
              return  headers[a].length +headers[cv].length
          }
        })

        this.sections=sections
      }else{
        throw Error('Not a valid header. Must be an Object')
      }
    }
    generateCurrentHeaders(){
      this._currentHeaders=[]
      this.jqTable.find('thead th').each(function(){
        this._currentHeaders.push($(this).text())
      })
    }
    get currentHeaders(){
      if (this.currentHeaders == null ){
        this.generateCurrentHeaders()
      }
      return this._currentHeaders
    }
    get columns(){
      return this._columns
    }
    set columns(cols){
      this._columns=cols
    }
    get sections(){
      return this._sections
    }
    set sections(sections){
        this._sections=sections
    }
    get lastRowTd(){
      return this.jqTable.find('tr#lastRow td')
    }
    get jsLastRow(){
      return document.getElementById("lastRow");
    }
    get jqLastRow(){
      return this.jqTable.find('tr#lastRow');
    }
    get loadedRows(){
      return this.jqTable.find('tbody tr').length-1
    }
    section(section){
      if(this.sections.indexOf(section) > -1){
        return this.headers[section]
      }else{
        throw Error('Section not found')
      }
    }    
  }
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
    createRow(row,search){
      var rowElement=document.createElement('tr')
      rowElement.setAttribute("sequence",row.row_attributes.Sequence.value)  //This is hard-coded
      if(search){
        rowElement.setAttribute("datatype","search-result")
      }
      var that=this  
      sectionOrder.forEach(function(section){
        that.section(section).forEach(header=>{
          let dataPoint=row[section][header.value]
          let cell=document.createElement('td')
          if(dataPoint.value instanceof Array){
            that.makeArrayCountButtonToGenerateModal(dataPoint,cell)          
          }else if(dataPoint.value==null){
              cell.textContent="N.D." 
          }else{
              //Exception for hyperlinking sequence !! TODO remove - front end to choose!! 
              if(header.value=="Sequence"){
                let a=mkel('a',{href:`/metadata/sequence/overview/${dataPoint.metadata["sequence-id"]}`,target:"_blank"},cell)
                a.textContent=dataPoint.value
              }else{
                cell.textContent=dataPoint.value  
              }
          }
          Object.keys(dataPoint.metadata).forEach(key=>{
            let value=dataPoint.metadata[key] 
            cell.setAttribute(key,value)
          })
          rowElement.append(cell)
          if(dataPoint.value instanceof Array){
            let listHeader=that.jqTable.find(`thead tr:nth(1) th[section|=${section}]`)
            that.appendListEl(processList(dataPoint.value),rowElement,listHeader,section,that)
          }
        })        
      })
      return rowElement
    }
    makeArrayCountButtonToGenerateModal(dataPoint,cell){
      let span=document.createElement('span')
      span.setAttribute('class', "badge badge-success")
      span.textContent=dataPoint.value.length
      cell.append(span)
      cell.setAttribute('title', "click to see list")
      cell.onclick=function(){
        let table=makeTableFromNestedArrayMatrix(dataPoint.value)
        $('.modal-body').empty()
        $('.modal-body').append(table)
        $('#exampleModalLong').modal('show')
      }  
    }
    appendListEl(chosenListElement,rowElement,listHeader,section,that){
      makeListElHeader(listHeader,section,chosenListElement,that)
      makeListElBody(chosenListElement,rowElement)

      function makeListElHeader(listHeader,section,chosenListElement,that){
        if(listHeader.length==1){
          listHeader.text(section)
          if(chosenListElement){
            let chosenListElementKeys=Object.keys(chosenListElement)
            chosenListElementKeys.reverse()
            chosenListElementKeys.forEach(function(col){
              if(col!="xref"){//EXCEPTION !!! THIS should be dealt with in a dynamic way    
                let header=document.createElement('th')
                header.textContent=col
                header.setAttribute('section', section)
                listHeader.after(header)                
              }
            })
            that.jqTable.find(`thead tr:nth(0) th[section|=${section}]`).attr('colspan',chosenListElementKeys.length) //(key.length + header - exceptions) This is incorrect it doesn't account for the col we removed but since these keys don't includer ${header} it actually is the right number          
          }
        }
      }
      function makeListElBody(chosenListElement,rowElement){
        if(chosenListElement instanceof Object){
          Object.keys(chosenListElement).forEach(function(col){
            let subCell=mkel('td',{},rowElement)
            let columnText=chosenListElement[col]
            if(col=="target_accession" && chosenListElement.xref){ //Exception !! THIS should be corrected
              let accessionLink=mkel('a',{href:`${chosenListElement.xref}${columnText}`},subCell)
              accessionLink.textContent=columnText
            }else if(col!="xref"){
              subCell.textContent=columnText
            }
          })
        }else{
          //TODO estimate space to fill with blank

        }
      }
    }
  }

})