$(document).ready(function(){
  var defaultHeaders={
    psRNAtarget:["miRNA_Acc.","Target_Acc.","Expectation","UPE","miRNA_start","miRNA_end","Target_start","Target_end","miRNA_aligned_fragment","Target_aligned_fragment","Inhibition","Target_Desc."]
  }
  $('.upload-targets').on('click', function (){
    $('#upload-files-upload').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
  });

  $('#upload-files-upload').on('change', function(){
    var files = $(this).get(0).files;
    let studyId=1
    if (files.length == 1){
      // One or more files selected, process the file upload

      // create a FormData object which will be sent as the data payload in the
      // AJAX request
      var formData = new FormData();

      // loop through all the selected files
      formData.append('uploads[]', files[0], files[0].name);
      
      $.ajax({
        url: `/de/targets/upload/${studyId}`,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data,textStatus,jqXHR){
          filename=data.file.name
          hash=data.file.hash
          setHeaderSelectMode(data.filePreview)
          if(filename=="UnsupportedFile"){
            alert("Unsupported file type! Try again")
            $('.progress-bar').text('0%');
            $('.progress-bar').width('0%');
          }else{

            $('.card.upload .card-footer input#file').val(filename)  
            $('.row.preview-header .card-header input#filename').val(filename)  
            $('.row.preview-header .card-header input#hash').val(hash)
            $('.row.preview-header .card-header input.select-header').removeClass('d-none')
          }
        },
        fail: function(jqXHR,textStatus,err){
          error=err
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
  function previewHeader(line,cellType,newTable,split){
    cellType=cellType || 'td'
    newTable=newTable || false
    split=split || '\t'
    anchoringPoint=""
    table=$('.preview-header table')
    if(table.length==0) newTable=true
    if(newTable){
      $('.preview-header table').remove()
      table=document.createElement("table")
      table.setAttribute("class", "table table-bordered")
      $('.row.preview-header .preview-header .card-body').append(table)
      table=$('.preview-header table')
    }else{
      table=$('.preview-header .card-body table')
    }

    if(cellType=='td'){
      table.children('tbody').remove()
      anchoringPoint=document.createElement('tbody')
      let stringifiedLine=JSON.stringify(line)
      $('.row.preview-header .card-header input#header').val(stringifiedLine)
      table.append(anchoringPoint)
    }else if(cellType=='th'){
      table.children('thead').remove()
      anchoringPoint=document.createElement('thead')
      table.append(anchoringPoint)
    }else{
      console.log("invalid cellType converted to <td>!") 
      cellType='td'
      table.children('tbody').remove()
      anchoringPoint=document.createElement('tbody')
      table.prepend(anchoringPoint)
    }

    var tr=document.createElement('tr')
    
    function headerInfo(){
      var cell=document.createElement('th')
      cell.textContent= cellType=="th" ? "Template header" : "Selected header"
      tr.append(cell)     
    }
    headerInfo()
    line= typeof line == "string" ? line.split(split) : line
    line.forEach(col=>{
      var cell=document.createElement(cellType)
      cell.textContent=col
      tr.append(cell)
    })
    anchoringPoint.innerHTML=""  
    anchoringPoint.append(tr)
  }


  $('select#targets-type').change(function(){
    let targetType=$(this).get(0).selectedOptions[0].text.trim()
    $('.row.preview-header.d-none').removeClass("d-none")
    try{
      let templateHeader=defaultHeaders[targetType]
      stringifiedHeader=JSON.stringify(templateHeader.toString().replace(/,/g,"\t"))
      $('.row.preview-header .card-header input#template').val(stringifiedHeader)
      previewHeader(templateHeader, 'th')
    }catch(err){
      console.log("No default header for this type program yet! - "+err)
    }
  })

  function setHeaderSelectMode(previewLines){
    $('.row.preview-header.d-none').removeClass("d-none")
    previewHeader(previewLines[0],'td')
    $('.row.preview-header .card-header input#line-selector').change(function(){
      let that=$(this)
      let value=that.val()-1
      if(value<previewLines.length && value >= 0) {
        previewHeader(previewLines[value],'td')
        highlightDefault(false)
        $('.row.preview-header .card-header input.select-header').val("use selected file header")
      }else{
        highlightDefault(true)
        $('.row.preview-header .card-header input.select-header').val("use default header")
      }
    }) 
  }
  function highlightDefault(template){
    var head=$('.row.preview-header .card-body table thead')
    var body=$('.row.preview-header .card-body table tbody')
    if(template){
      highlightHead(head,body)
    }else{
      highlightBody(head,body)
    }
  }
  function highlightHead(head,body){
    let headCells=head.find('tr').children()
    let bodyCells=body.find('tr').children()
    headCells.css('border-top','2px solid red')
    headCells.css('border-bottom','2px solid red')
    headCells.first().css('border-left','2px solid red')
    headCells.last().css('border-right','2px solid red')
    bodyCells.first().css('border-left','1px solid #dee2e6')
    bodyCells.last().css('border-right','1px solid #dee2e6')
    bodyCells.css('border-bottom','1px solid #dee2e6')

  }
  function highlightBody(head,body){
    let headCells=head.find('tr').children()
    let bodyCells=body.find('tr').children()
    headCells.css('border-top','1px solid #dee2e6')
    headCells.css('border-bottom','2px solid red')
    headCells.first().css('border-left','1px solid #dee2e6')
    headCells.last().css('border-right','1px solid #dee2e6')
    bodyCells.first().css('border-left','2px solid red')
    bodyCells.last().css('border-right','2px solid red')
    bodyCells.css('border-bottom','2px solid red')
  }  
}) 
 