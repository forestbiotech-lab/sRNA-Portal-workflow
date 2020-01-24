$(document).ready(function(){ 
  var previouslySelectedOption=""
  var previouslySelectedTable=""
  let tableAssignment={}
  
  $('select#associate').click(function(){
      let that=$(this)
      previouslySelectedTable=that.get(0).selectedOptions[0].text 
  })

  $('select#associate').change(function(){
    let that=$(this)
    let table=that.get(0).selectedOptions[0].text 
    let select=$(`.table-attributes select[table|=${table}]`).clone()
    let tableAttributesSelect=that.closest('li').children('select#table-attributes')    
    if(tableAttributesSelect.length>0){
      previouslySelectedOption=tableAttributesSelect.get(0).selectedOptions[0].text
      $(`.card[table|=${previouslySelectedTable}] li#${previouslySelectedOption} .badge.index`).text("")
      $(`.card[table|=${previouslySelectedTable}] li#${previouslySelectedOption} .badge.name`).text("")      
    }
    that.closest('li').children('select#table-attributes').remove()
    that.closest('li').append(select)
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

  $('button.save').click(function(){
    let datastructure={update:[],create:[],unset:[]}
    $(`.card.fileSelections .card-body li`).each(function(idx){
      let that=$(this)
      if(isElementActive(that)){
        let id=that.attr("profileid")
        let fileColumnIndex=idx
        let table=that.find('select#table-attributes').attr('table')
        let columnName=that.find('select#table-attributes').get(0).selectedOptions[0].text
        if(id==''){
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
      url:`/de/target/profile/set/target/${profile}`,
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
      url:`/de/target/profile/get/target/${profile}`,
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
    return el.attr('profileid') != "" 
  }

  function triggerAlert(msg,type){
    let alert=$('.alert.template').clone()
    alert.removeClass('d-none').removeClass('template').addClass(`alert-${type}`)
    alert.find('strong').text(msg)
    alert.prependTo('.row.alerts')
  }
})




