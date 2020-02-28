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
})