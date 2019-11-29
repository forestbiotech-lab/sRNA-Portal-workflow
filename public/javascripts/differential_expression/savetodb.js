$(document).ready(function(){
  var now=''
  var then=''
  var successes=0
  var errors=0
  $('.card.upload-table .card-header button.upload-matrix').click(function(){
    now=new Date()
    let dataset={}
    let sequenceSet=[]
    $(this).closest('.card').find('.card-body tbody tr').each(function(){
      let that=$(this)
      let row=[]
      that.children('td').each(function(){
        row.push($(this).text())
      })
      let sequence=row[0]
      row.slice(1)
      dataset[sequence]=row
      sequenceSet.push({sequence})
    })
    console.log(sequenceSet)
    uploadRows({sequenceSet})
    //that.empty()
    then=new Date()
    elapsedTime=(then-now)/1000
    console.log({successes,errors,elapsedTime})
  })




  function uploadRows(row){
    $.ajax({
      url: '/de/savetodatabase',
      type: 'PUT',
      data: row,
      dataType: 'json',
      success: function(data,textStatus,jqXHR){
        successes++
        then=new Date()
        elapsedTime=(then-now)/1000
        console.log({successes,errors,elapsedTime})
      },error:function(jqXHR,textStatus,err){
        errors++
      },xhr: function() {
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
    })
  }


})