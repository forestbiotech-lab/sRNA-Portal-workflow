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
      success:function(data,textStatus,jsXHR){
        that.next().find(`.select-${table}`).html(data)
        that.next().find('select.basic-form.select-form').on('change',loadEntry)         
      },
      error:function(err){
        console.log(err)
      }
    })
  })

  function loadEntry(){
    let that=$(this)
    var selectedOptions=that.get(0).selectedOptions[0].text
    var id=parseInt(selectedOptions)

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