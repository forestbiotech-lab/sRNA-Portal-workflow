$(document).ready(function(){


  $('.row.file-submission .card-body .upload-matrix').on('click', function (){
    $('.row.file-submission .card-body #upload-files-upload').click();
    $('.row.file-submission .card-body .progress-bar').text('0%');
    $('.row.file-submission .card-body .progress-bar').width('0%');
  });
  $('.row.file-submission .card-body #upload-files-upload').on('change', function(){
    let studyId=$('.row.file-submission form.view-matrix input#studyId').val()
    var files = $(this).get(0).files;
    if (files.length == 1){
      // One or more files selected, process the file upload

      // create a FormData object which will be sent as the data payload in the
      // AJAX request
      var formData = new FormData();

      // loop through all the selected files

      formData.append('uploads[]', files[0], files[0].name);

      $.ajax({
        url: `/de/upload/${studyId}`,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data,textStatus,jqXHR){
          let filename=data.name
          let hash=data.hash
          if(filename=="UnsupportedFile"){
            alert("Unsupported file type! Try again")
            $('.row.file-submission .card-body .progress-bar').text('0%');
            $('.row.file-submission .card-body .progress-bar').width('0%');
          }else{
            $('.row.file-submission .card-footer input#file').val(filename)  
            $('.row.file-submission .card-footer form.view-matrix input#filename').val(filename)
            $('.row.file-submission .card-footer form.view-matrix input#hash').val(hash)
            $('.row.file-submission .card-footer form.view-matrix input.btn').removeClass('d-none')
          }
        },
        error: function(jqXHR,textStatus,error){
          $('.row.file-submission .card-footer form.view-matrix input#filename').val('Error! Try again!')
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
              $('.row.file-submission .card-body .progress-bar').text(percentComplete + '%');
              $('.row.file-submission .card-body .progress-bar').width(percentComplete + '%');

              // once the upload reaches 100%, set the progress bar text to done
              if (percentComplete === 100) {
                $('.row.file-submission .card-body .progress-bar').html('Done');
              }

            }

          }, false);

          return xhr;
        }
      });
    }
  }); 
 

 //Assays template
 let assaybadge=$('.card.assay-list span.badge#assay-data-count')
 if(assaybadge.length>0){
  studyId=$('.row.file-submission .card-body .card-header.studyInfo').attr('studyId')
  $.ajax({
    url:"/de/count/assaydata",
    type:"POST",
    data:{studyId},
    success:((data,textStatus,jqXHR) =>{
      assaybadge.text(`Assay data: ${data}`)
    }),
    error:((qXHR,textStatus,err)=>{
      assaybadge.text(`Assay data: Not Found`)
    })
  })
 }



});