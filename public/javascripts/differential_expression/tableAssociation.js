$(document).ready(function(){ 
  var previouslySelectedOption=""
  var previouslySelectedTable=""
  let tableAssignment={}
  const SPECIAL="Accession_Search"

  $('select#associate').click(function(){
      let that=$(this)
      previouslySelectedTable=that.get(0).selectedOptions[0].text 
  })

  $('select#associate').change(function(){
    let that=$(this)
    let table=that.get(0).selectedOptions[0].text
    if(table==SPECIAL){
      tools=$('span.octicon.octicon-tools').clone()
      that.closest('li').children('span.special-tools').append(tools)
      tools.removeClass('d-none')
      tools.click(function(){
        that=$(this)
        
        let toolSelect=document.createElement('select')
        let option=document.createElement('option')
        option.textContent="split"
        toolSelect.append(option)
        that.closest('span.special-tools').append(toolSelect)
        
        let splitter=document.createElement('input')
        splitter.setAttribute('name', "splitter")
        splitter.setAttribute('type', "text")
        splitter.setAttribute('placeholder', "splitter")
        that.closest('span.special-tools').append(splitter)

        let indexSelect=document.createElement('select')
        option=document.createElement('option')
        indexSelect.append(option)
        option.textContent=0      
        option=document.createElement('option')
        indexSelect.append(option) 
        option.textContent=1
        option=document.createElement('option')
        indexSelect.append(option)
        option.textContent=2      
        option=document.createElement('option')
        indexSelect.append(option)        
        that.closest('span.special-tools').append(indexSelect)

      })
    } 
    let select=$(`.table-attributes select[table|=${table}]`).clone()
    let tableAttributesSelect=that.closest('span.selects').children('select#table-attributes')    
    if(tableAttributesSelect.length>0){
      previouslySelectedOption=tableAttributesSelect.get(0).selectedOptions[0].text
      $(`.card[table|=${previouslySelectedTable}] li#${previouslySelectedOption} .badge.index`).text("")
      $(`.card[table|=${previouslySelectedTable}] li#${previouslySelectedOption} .badge.name`).text("")      
    }
    that.closest('span.selects').children('select#table-attributes').remove()
    that.closest('span.selects').append(select)
    select.click(function(){
      let that=$(this)
      previouslySelectedOption=that.get(0).selectedOptions[0].text
    })
    select.change(function(){
      let that=$(this)
      let table=that.attr("table")
      var selectedOption=that.get(0).selectedOptions[0].text
      var fileColumn=that.closest("li").attr('id')
      var fileColumnName=that.closest("li").text().split(" ")[0]
      if(previouslySelectedOption!=selectedOption){
        $(`.card[table|=${table}] li#${selectedOption} .badge.index`).text(fileColumn)
        $(`.card[table|=${table}] li#${selectedOption} .badge.name`).text(fileColumnName)
        if(previouslySelectedOption!=""){
          $(`.card[table|=${table}] li#${previouslySelectedOption} .badge.index`).text("")
          $(`.card[table|=${table}] li#${previouslySelectedOption} .badge.name`).text("")
        }
      }
    })
  })

  $('.add-xref input.xref-input').change(function(){
    let xref=$(this).val()+"abs"
    addXref(xref)
  })
  $('.add-xref input.xref-input').keyup(function(){
    let xref=$(this).val()+"abs"
    addXref(xref)
  })
  function addXref(xref){
    addToBadge(xref)
    addToTestLink(xref)
    function addToBadge(xref){
      $('.add-xref span.badge.xref-preview').text(xref)
    }
    function addToTestLink(xref){
      $('.add-xref a.xref-preview').attr('href',xref)
    }
  }

  $('button.save').click(function(){
    let datastructure={update:[],create:[],unset:[]}
    $(`.card.fileSelections .card-body li`).each(function(idx){
      let that=$(this)
      if(isElementActive(that)){
        let id=that.attr("profileid")
        let fileColumnIndex=idx
        let table=that.find('select#table-attributes').attr('table')
        let columnName=that.find('select#table-attributes').get(0).selectedOptions[0].text
        if( id=='' || id==undefined ){
          datastructure.create.push({table,columnName,fileColumnIndex})
        }else{
          datastructure.update.push({inserts:{table,columnName,fileColumnIndex},where:{id}})
        }
      }else{
        if(isElementInDB(that)){
          let id=that.attr("profileid")
          datastructure['unset'].push({id})
        }
      }        
    })
    let profile=$('select.profile').get(0).selectedOptions[0].text
    $.ajax({
      url:`/de/targets/profile/set/target/${profile}`,
      type:'POST',
      data:datastructure,
      success:function(data,textStatus,jqXHR){
        triggerAlert("Success!", "success")
      },
      error:function(jqXHR,textStatus,err){
        triggerAlert("Failed!", "danger") 
      }
    })
  })

  $('select.profile').change(function(){
    let profile=$(this).get(0).selectedOptions[0].text
    $.ajax({
      url:`/de/targets/profile/get/target/${profile}`,
      type:'GET',
      processData:false,
      contentType: false,
      success: function(data,textStatus,jqXHR){
        reproduceProfile(data)
      },
      error: function(qXHR,textStatus,err){
        triggerAlert("Failed!", "danger")
      }
    })
  })

  function reproduceProfile(data){
    if(data.length>0){
      cleanPreviousSelections()
      data.forEach(row=>{
        let table=row.table
        let attribute=row.columnName
        let index=row.fileColumnIndex
        let id=row.id
        setFileSelection(id,index,table,attribute)
      })
    }
  }

  function cleanPreviousSelections(){
    $(`.card.fileSelections .card-body li`).each(function(){
      let that=$(this)
      that.attr('profileid','')  //empty profile
      that.children('select#associate').trigger('click') //store previous state
      that.find('select#associate option').prop('selected',false) //set to default
      that.children('select').trigger('change')  //trigger change to reset everything
    })
  }

  function setFileSelection(id,index,table,attribute){
    let selectTable=$(`.card.fileSelections .card-body li:nth(${index}) select#associate option:contains(${table})`)
    selectTable.prop('selected',true)
    selectTable.trigger('change')
    let selectAttribute=$(`.card.fileSelections .card-body li:nth(${index}) select#table-attributes option:contains(${attribute})`)
    selectAttribute.prop('selected',true)
    selectAttribute.trigger('change')
    $(`.card.fileSelections .card-body li:nth(${index})`).attr('profileid',id)
  }

  function isElementActive(el){
    let select=el.children('select#table-attributes')
    if(select.length==0){ 
      return false
    }else if(select.get(0).selectedIndex==0){
      return false
    }else{
      return true
    }
  }
  function isElementInDB(el){
    if(el.attr('profileid')==undefined) el.attr('profileid','') 
    return el.attr('profileid') != ""
  }

  function triggerAlert(msg,type){
    let alert=$('.alert.template').clone()
    alert.removeClass('d-none').removeClass('template').addClass(`alert-${type}`)
    alert.find('strong').text(msg)
    alert.prependTo('.row.alerts')
  }
  $('.modal .modal-footer button.save-changes').click(function(){
    let newProfile=$(this).closest('.modal-content').find('.modal-body input').val()
    $(this).closest('.modal-content').find('.modal-body input').val("")
    if(newProfile.length>=0){
      newProfile=newProfile.replace(" ","_")
      let newOption=document.createElement('option')
      newOption.textContent=newProfile
      $('select#profile.profile').append(newOption)
      $('select#profile.profile').find('option').prop('selected',false)
      $(`select#profile.profile option:contains(${newProfile})`).prop('selected',true)
      $('.modal#new-profile').modal('hide')
    }
   })

  //$('button.test').click(function(){
  $('.save-targets button.save-targets').click(function(){
    function getTranscriptXref(){
      xref=$('input.xref-input').val()
      if(xref){
        return xref
      }else{
        return ''
      }
    }
    let data={
      target_filename:$('.card-body.target_filename input').val(),
      transcript_xref:getTranscriptXref()
    }
    $.ajax({
      url:"/de/targets/load/db/",
      method:"POST",
      data:data,
      success:function(data,textStatus,jqXHR){
        const HOSTNAME=document.location.hostname
        const CONNECTIONPROTOCOL = HOSTNAME=="localhost" ? "ws" : "wss"
        const PORT=8080
        startWebSocket(`${CONNECTIONPROTOCOL}://${HOSTNAME}:${PORT}`,data,processEvt)
        

        /*
        let table=document.createElement('table')
        data.failure.lines.forEach(line=>{        
          let tr=document.createElement('tr')
          tdMessage=document.createElement('td')
          tdDescription=document.createElement('td')
          tdMessage.textContent=line.msg
          tdDescription.textContent=JSON.stringify(line.description)
          tr.append(tdMessage)
          tr.append(tdDescription)
          table.append(tr)
          table.setAttribute('class', 'table table-bordered')
        })
        $('.card-body.result').append(table) 
        $('.card-body.result').append(`Success:${data.success}`) 
        */
      },
      error:function(jqXHR,textStatus,err){
        $('.card-body.result').text(`${textStatus}:${err}`) 
      }
    })
    function processEvt(msg){
      // calculate the percentage of upload completed
      let receivedMsg=JSON.parse(msg)
      if(receivedMsg.msg){
        percentComplete = parseInt(receivedMsg.msg.percentageComplete);        
        
        // update the Bootstrap progress bar with the new percentage
        $('.save-targets .progress-bar').text(percentComplete + '%');
        $('.save-targets .progress-bar').width(percentComplete + '%');
      }
     
      
      //$('.save-target .badge#uploadErrors').text(receivedMsg.errors)
      //$('.save-target .badge#uploadSuccesses').text(receivedMsg.successes)
      /*if(percentComplete==100){
        $('.card.upload-table .card-body .view-assays').removeClass('d-none')
      }*/
  }

  })




})





