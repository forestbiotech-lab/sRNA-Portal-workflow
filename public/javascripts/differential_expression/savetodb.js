$(document).ready(function(){
  let rawReadsfilename=$('table tbody tr#lastRow').attr('filename')
  let iterStep=50


  $('.card.upload-table .card-body button.upload-matrix').click(function(){
    sequence="ATAGTTTTTT"   //TODO not even sure what this is.
    occurence=0             //TODO humm???
    killList=killList || {}  //TODO not implemented
    if (!$(this).hasClass("disabled")){
      $(this).addClass('disabled')
      saveRows(studyId,sequenceAssemblyComposite,rawReadsfilename,killList,$(this))
    }
  })

  function saveRows(studyId,sequenceAssemblyComposite,rawReadsfilename,killList,origin){
    function closeCallback(){
      origin.removeClass("disabled")
    }
   let data={studyId,sequenceAssemblyComposite,rawReadsfilename,killList,}
    $.ajax({
      url: '/de/uploadMatrix',
      type: 'POST',
      data: data,
      dataType: 'json',
      success: function(data,textStatus,jqXHR){
        const HOSTNAME=document.location.hostname
        const CONNECTIONPROTOCOL = HOSTNAME=="localhost" ? "ws" : "wss"
        const PORT=8080

        startWebSocket(`${CONNECTIONPROTOCOL}://${HOSTNAME}:${PORT}`,data,processEvt,closeCallback)
      },error:function(jqXHR,textStatus,err){
        console.log(jqXHR)
        alert("Upload failed!")
      }
    })
  }

  function processEvt(msg){
    // calculate the percentage of upload completed
    let receivedMsg=JSON.parse(msg)
    
    percentComplete = parseInt(receivedMsg.percentageComplete);
      
    // update the Bootstrap progress bar with the new percentage
    $('.card.upload-table .card-body .progress-bar').text(percentComplete + '%');
    $('.card.upload-table .card-body .progress-bar').width(percentComplete + '%');
    $('.card.upload-table .card-body .badge#uploadErrors').text(receivedMsg.errors)
    $('.card.upload-table .card-body .badge#uploadSuccesses').text(receivedMsg.successes)
    if(percentComplete==100){
      $('.card.upload-table .card-body .view-assays').removeClass('d-none')
    }
  }

/*  var uploadMatrix=varListener.a
  var now=''
  var then=''
  var successes=0
  var errors=0
  let iteration=0
  const rowsPerIter=50
  let uploadedRows=0
  let uploadableRows=0
  let fullTable=false


  if(uploadMatrix.length==0){
    varListener.registerListener(function(matrix){
      uploadMatrix=matrix
      uploadableRows=Object.keys(uploadMatrix.hashLookup).length
    })
  }
  
  $('.card.upload-table .card-header button.upload-matrix').click(function(){
    then=new Date()
    let dataset=''
    $('.progress-bar').width('0');
    $('.progress-bar').text('0%');
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



  function uploadRows(rows,assayIds){
    let uploadPercentage=rows.length/uploadableRows
    studyId=uploadMatrix.studyId
    dataset={headers:uploadMatrix.header,rows,studyId,assayIds}
    $.ajax({
      url: '/de/uploadMatrix',
      type: 'PUT',
      data: dataset,
      dataType: 'json',
      success: function(data,textStatus,jqXHR){
        successes++
        iteration++
        showProccessTime()
        if(iteration*rowsPerIter>=uploadableRows) fullTable=true      
        if(!fullTable) uploadRows(extractUploadRows(),data) 
      },error:function(jqXHR,textStatus,err){
        errors++
        console.log(jqXHR)
        alert("Upload failed!")
      },xhr: function() {
          // create an XMLHttpRequest
          var xhr = new XMLHttpRequest();
          // listen to the 'progress' event
          xhr.upload.addEventListener('progress', function(evt) {
            processEvt(evt,uploadPercentage)
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

  function processEvt(evt,uploadPercentage){    
    currentProgress=$('.progress-bar').text();
    currentProgress=parseInt(currentProgress)
    if (evt.lengthComputable) {
      // calculate the percentage of upload completed
      var percentComplete = ( currentProgress + ( evt.loaded / evt.total ) * uploadPercentage * 100);
      percentComplete = parseInt(percentComplete);
      
      // update the Bootstrap progress bar with the new percentage
      $('.progress-bar').text(percentComplete + '%');
      $('.progress-bar').width(percentComplete + '%');

      // once the upload reaches 100%, set the progress bar text to done
      if (percentComplete === 100) {
        $('.progress-bar').html('Done');
      }
    }
  }

function showProccessTime(){
  now=new Date()
  elapsedTime=(now-then)/1000
  console.log({successes,errors,elapsedTime})
}*/

})

