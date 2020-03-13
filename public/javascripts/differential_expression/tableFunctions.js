//This script is used to generate forms from tables

$(document).ready(function(){
  $('button.generate-table-form').on('click',function(){
    let that=$(this)
    var table=that.attr('table')
    $.ajax({
      url:`/forms/factory/fromtable/basic/${table}`,
      type:'GET',
      success: function(data,textStatus,jqXHR){
        that.next().find(`.form-${table}`).html(data)          
      }
    })
  })
  $('button.generate-select-form').on('click',function(){
    let that=$(this)
    var table=that.attr('table')
    var displayAttr=that.attr('displayAttr')
    attributes=['id',displayAttr]
    $.ajax({
      url:`/forms/factory/select/basic/${table}`,
      type:'POST',
      data:{attributes},
      dataType:'html',
      success:function(data,textStatus,jqXHR){
        let selectTarget=that.next().find(`.select-${table}`)
        selectTarget.html(data)
        selectTarget.change(loadEntry(selectTarget))         
      },
      error:function(err){
        console.log(err)
      }
    })
  })
  function loadEntry(context){
      //for some reason when I do this directly the on change listener doesn't persist
      context.find('select').on('change',function(){
        var that=$(this)
        var selectedOptions=that.get(0).selectedOptions[0].text
        var id=parseInt(selectedOptions)

        var table=that.attr('table')
        let tableForm=that.closest('.card.card-body').find(`.form-${table}`)
        $.ajax({
          url: `/forms/factory/fromTable/byId/${table}/${id}`,
          type: 'get',
          success:function(data,textStatus,jqXHR){
            loadForm(data,tableForm)
          },
          error:function(qXHR,textStatus,err){
            console.log(err)
          }
        })
      })

  }

  function loadForm(data,form){
    Object.keys(data).forEach(function(attribute){
      let input=form.find(`#${attribute}`)
      let inputType=input.attr('type')
      if(inputType=="checkbox"){
        input.prop('checked',data[attribute])
      }else{       
        input.val(data[attribute])
      }
    })
    form.find('input.btn.disabled').val('Update')
    let action=form.find('form.basic-form.table-form').attr('action')
    action=action.replace("save","update")
    form.find('form.basic-form.table-form').attr('action',action)
    $('form.view-matrix input#studyId').val(data.id)
    $('form.view-matrix input#studyTitle').val(data.title)
    $('.card-body h4.study.card-title span#studyTitle').text(data.title)
    $('.row.file-submission').removeClass('d-none')
    $('form.view-matrix input.btn.disabled').removeClass('disabled')
    $('form.view-matrix input.btn').attr('type','submit')
  }
  $('button.generate-table-list').on('click',function(){
    let that=$(this)
    var table=that.attr('table')
    $.ajax({
      url:`/forms/factory/table/basic/${table}`,
      type:'GET',
      success: function(data,textStatus,jqXHR){
        that.closest('.card').find(`.list-${table}`).html(data)
        let tableEl=that.closest('.card').find(`.list-${table}`).find('table')
        setClickActions(tableEl)          
      }
    })
  })
  function setClickActions(table){
    table.find('tbody tr').click(function(){
      let that=$(this)
      let target=that.closest('.card-body')
      if(that.attr('isSelected')=="true"){
        target.next().remove()
        that.attr('isSelected',"false")    
      }else{
        removePreviousSelections(that,target)
        let tableId=that.attr('tableid')
        let panel=makePanel(tableId,target)
        that.attr('isSelected',"true")
      }
    })
  } 
  function removePreviousSelections(that,target){
    target.next().remove()
    that.closest('tbody').find('tr').each(function(){
      $(this).attr('isSelected',"false")
    })
  }
  function makeLinkButton(name,url,classes){
    let button = document.createElement('a');
    button.textContent=name
    button.className=classes
    button.href=url
    return button
  }
  async function makePanel(tableId,target){
    let panel=document.createElement('div')
    let alert=document.createElement('div')
    let span=document.createElement('span')
    panel.className="card-body"
    alert.className="alert alert-primary"
    span.className="badge badge-secondary"
    span.textContent=await countAssociatedTables("Study","Assay",tableId)
    let uploadData=makeLinkButton('Upload Data',`/de/assays/${tableId}`,"btn btn-primary assays")
    let assays=makeLinkButton('View Assays',`/de/assays/${tableId}`,"btn btn-primary assays")
    let targets=makeLinkButton('View Targets',`/de/targets/new`,"btn btn-primary targets")

    panel.append(alert)
    alert.append(span)
    alert.insertAdjacentText('afterBegin',"This study has ")
    alert.insertAdjacentText('beforeEnd'," assays ")
    alert.append(uploadData)
    alert.append(assays)
    alert.append(targets)
    target.after(panel)
  }
  function countAssociatedTables(tablename,associatedTable,tableId){
    return new Promise((res,rej)=>{
      let attributes={
        tableId,
        associatedTable,
        tablename
      }
      $.ajax({
        type:"post",
        url:"/forms/count/associatedTables",
        data:attributes,
        success:function(data,textStatus,jqXHR){
          res(data)
        },
        error:function(qXHR,textStatus,err){
          rej(err)
        }
      })
    })
  }  
})