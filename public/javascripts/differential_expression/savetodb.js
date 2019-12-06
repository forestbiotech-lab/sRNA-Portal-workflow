$(document).ready(function(){
  var uploadMatrix=varListener.a
  var now=''
  var then=''
  var successes=0
  var errors=0
  let iteration=0
  const rowsPerIter=50
  let uploadedRows=0
  let fullTable=false


  if(uploadMatrix.length==0){
    varListener.registerListener(function(matrix){
      uploadMatrix=matrix
    })
  }
  
  $('.card.upload-table .card-header button.upload-matrix').click(function(){
    now=new Date()
    let dataset=''
    if(uploadMatrix instanceof Array){
      varListener.registerListener(function(matrix){
        uploadMatrix=matrix
        dataset=extractUploadRows()
        uploadRows(dataset)
      })
    }else{
        dataset=extractUploadRows()
        uploadRows(dataset)
    }
  })



  function uploadRows(rows){
    data={headers:uploadMatrix.header,rows,studyId:uploadMatrix.studyId}
    $.ajax({
      url: '/de/uploadMatrix',
      type: 'PUT',
      data: data,
      dataType: 'json',
      success: function(data,textStatus,jqXHR){
        successes++
        then=new Date()
        elapsedTime=(then-now)/1000
        console.log({successes,errors,elapsedTime})
      //After success
      //iteration++
      //addLoadedRows(rows.length)      

//      if(loadedRows>=uploadNumber) fulltable=true      
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

  function extractUploadRows(){
    let start=iteration*rowsPerIter
    let hashes=Object.keys(uploadMatrix.hashLookup).slice(start,start+rowsPerIter)
    let rows=[]
    hashes.forEach(function(hash){
      let row=uploadMatrix.hashLookup[hash]
      if (row.length == 1)
        if( uploadMatrix.duplicateSeq.indexOf( row[0][0] ) ==-1 )
          rows.push(row[0])
    })
    return rows
  }

})