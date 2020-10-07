$(document).ready(function(){
  var defaultHeaders={
    psRNAtarget:["miRNA_Acc.","Target_Acc.","Expectation","UPE","miRNA_start","miRNA_end","Target_start","Target_end","miRNA_aligned_fragment","Target_aligned_fragment","Inhibition","Target_Desc."]
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

  $('.upload-targets').on('click', function (){
    $('#upload-files-upload').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
  });
  $('#upload-files-upload').on('change', function(){
    var files = $(this).get(0).files;
    let studyId=$(this).attr('study-id')
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
              $('.progress.targets-file .progress-bar').text(percentComplete + '%');
              $('.progress.targets-file .progress-bar').width(percentComplete + '%');

              // once the upload reaches 100%, set the progress bar text to done
              if (percentComplete === 100) {
                $('.progress.targets-file .progress-bar').html('Done');
              }

            }

          }, false);

          return xhr;
        }
      });
    }
  });

  $('button.upload-augment-file').on('click', function (){
    $('input#augment-file').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
  });
  $('input#augment-file').on('change', function(){
    let self=$(this)
    var files = $(this).get(0).files;
    let studyId=$(this).attr('study-id')
    if (files.length == 1){
      // One or more files selected, process the file upload

      // create a FormData object which will be sent as the data payload in the
      // AJAX request
      var formData = new FormData();
      // loop through all the selected files
      formData.append('uploads[]', files[0], files[0].name);
      
      $.ajax({
        url: `/de/targets/augment-info/upload/${studyId}`,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data,textStatus,jqXHR){
          if(success) success(data)
        },
        fail: function(jqXHR,textStatus,err){
          displayToast("Error",err,4000)
        },
        xhr: function() {
          return progress()
        }
      });
      function progress(){
        // create an XMLHttpRequest
        var xhr = new XMLHttpRequest();

        // listen to the 'progress' event
        xhr.upload.addEventListener('progress', function(evt) {
          let progressBar=makeProgressBar("progress-augment-dynamic")
          self.closest('.form-group').append(progressBar)
          if (evt.lengthComputable) {
            var percentComplete = evt.loaded / evt.total;
            percentComplete = parseInt(percentComplete * 100);
            progressBar=$('.progress.progress-augment-dynamic .progress-bar')
            progressBar.text(percentComplete + '%');
            progressBar.width(percentComplete + '%');
            if (percentComplete === 100) {
              progressBar.html('Done');
            }
          }
        }, false);
        return xhr;
      }
    }
    function success(data){
      filename=data.file.name
      hash=data.file.hash
      if(filename=="UnsupportedFile"){
        displayToast("Warning!","Unsupported file type! Please try again with another file. Should be a tab seperated value (.tsv) file.")
        resetProgressBar(".progress-augment-dynamic")
      }else{
        let table=makePreviewTable(self,data)
        makeSelectors(table)
        generateSubmitButton(table,self,data)
      }
    }
  })

  function generateSubmitButton(table,self,data){
    //TODO data to send
    //key table attr  //Query
    //dValue table attr
    //Study Id   //Query
    let studyId=self.attr("study-id")
    let button=makeButton({
        icon:"export",
        text:"Add information to database"
      },{
        class:"btn btn-success btn-block",
        "file-name":data.file.name,
        "study-id":studyId
      },{
        evt:"click",
        callback:startDBImport
      }
    )
    table.closest('div').prepend(button)
  }
  function startDBImport(){
    let self=$(this)
    let fileName=self.attr('file-name')
    let studyId=self.attr('study-id')  
    $.ajax({
      url:"/de/targets/augment-info/update",
      method:"POST",
      data:{
        fileName,
        studyId
      },success:function(data,textStatus,jqXHR){
        let progressBar=makeProgressBar("database-augment-commit")  
        self.closest('div').prepend(progressBar)
        startWebSocket(data,processEvt)
      },fail:function(jqXHR,textStatus,err){
        displayToast('Error',err,4000)
      }
    })
    
  }
  function processEvt(data){
    console.log(data)
    data=JSON.parse(data)
    if(data.msg){
      handleMsg(data.msg)
    }else if(data.error){
      displayToast("Error",data.error,4000)
    }else{
      console.log(data)  
    }
    //action for errors
    //msg
    //progress
    function handleMsg(msg){
      if(msg.percentageComplete){
        let percentComplete=Math.round10(msg.percentageComplete,-2)
        let progressBar=$('.progress.database-augment-commit .progress-bar')
        progressBar.text(percentComplete)
        progressBar.width(percentComplete+"%")

      }
    }

  }
  function makeProgressBar(identifier){
    let progress=mkel('div',{class:`progress ${identifier}`})
    mkel("div",{
      class:"progress-bar bg-success",
      role:'progressbar'
    },progress)
    return progress
  }
  function resetProgressBar(identifier){
    let progressBar=$(`.progress${identifier} .progress-bar`)
    progressBar.text('0%');
    progressBar.width('0%');
  }
  function makeSelectors(table){
    let selectorRowContents=[]
    let selectorCellAttr=[]
    table.find('th').each(function(){
        let text=$(this).text()
        let div=mkel('div')
        let tableSelect=makeSelect({class:`custom-select ${text}`},[{name:"Table"}])
        let attributeSelect=makeSelect({class:`custom-select ${text}`},[{name:"Attribute"}])
        div.append(tableSelect)
        div.append(attributeSelect)
        selectorRowContents.push(div)
    })
    table.prepend(makeRow({},selectorRowContents,selectorCellAttr,true))
  }
  function makePreviewTable(self,data){
    let table=mkel("table",{class:"table preview-augment-file"})
    let dummyScrollDiv=self.closest('div').nextAll('.preview-table').find('.scroll .dummy')
    let tableScroll=self.closest('div').nextAll('.preview-table').children('.table-div')
    tableScroll.html(table)
    tableScroll.closest('.preview-table').removeClass('d-none')
    data.filePreview.forEach((line,index)=>{
      table.append(makeRow({},line.split("\t"),{},index==0))
    })
    dummyScrollDiv.width(self.closest('div').nextAll('.preview-table').find('table.table').width())
    $(function(){
      let dummyScroll=dummyScrollDiv.closest('.scroll');
      dummyScroll.scroll(function(){
          tableScroll.scrollLeft(dummyScroll.scrollLeft());
      });
      tableScroll.scroll(function(){
          dummyScroll.scrollLeft(tableScroll.scrollLeft());
      });
    });
    return tableScroll.children('table')
  }
  function getAttributeList(table){

  }
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
 