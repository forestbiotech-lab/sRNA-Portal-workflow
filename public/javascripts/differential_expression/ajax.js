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
    attributes=['id','title']
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
    $('.card-body h4.study.card-title span#studyTitle').text(data.title)
    $('form.view-matrix input.btn.disabled').removeClass('disabled')
    $('form.view-matrix input.btn').attr('type','submit')

  }

  $('.upload-matrix').on('click', function (){
    $('#upload-files-upload').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
  });
  $('#upload-files-upload').on('change', function(){

    var files = $(this).get(0).files;
    if (files.length == 1){
      // One or more files selected, process the file upload

      // create a FormData object which will be sent as the data payload in the
      // AJAX request
      var formData = new FormData();

      // loop through all the selected files
      formData.append('uploads[]', files[0], files[0].name);

      $.ajax({
        url: '/de/upload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data,textStatus,jqXHR){
          console.log(data)
          let filename=data.name
          let hash=data.hash
          if(filename=="UnsupportedFile"){
            alert("Unsupported file type! Try again")
            $('.progress-bar').text('0%');
            $('.progress-bar').width('0%');
          }else{
            $('.card.upload .card-footer input#file').val(filename)  
            $('form.view-matrix input#filename').val(filename)
            $('form.view-matrix input#hash').val(hash)
          }
        },
        xhr: function() {
          // create an XMLHttpRequest
          var xhr = new XMLHttpRequest();

          // listen to the 'progress' event
          xhr.upload.addEventListener('progress', function(evt) {

            if (evt.lengthComputable) {
              // calculate the percentage of upload completed
              var percentComplete = evt.loaded / evt.total;
              percentComplete = parseInt(percentComplete * 100);

              // update the Bootstrap progress bar with the new percentage
              $('.progress-bar').text(percentComplete + '%');
              $('.progress-bar').width(percentComplete + '%');

              // once the upload reaches 100%, set the progress bar text to done
              if (percentComplete === 100) {
                $('.progress-bar').html('Done');
              }

            }

          }, false);

          return xhr;
        }
      });
    }
  }); 
 



});