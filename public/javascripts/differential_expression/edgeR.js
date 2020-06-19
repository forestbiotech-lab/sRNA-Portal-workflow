$('document').ready(()=>{

var activeManifest;
  
function calculateDE(){
  $('.card.differential-expression').removeClass('d-none')
  $.ajax({
    url:"/vm/api/v1/run/de",
    method:"get",
    success:function(protocol,textStatus,jqXHR){
      openConnection(protocol)
    },
    error(jqXHR,textStatus,err){
      makeToolTipNotification("Error","Unable to calculate differential expression!")
    }
  })
}

var statusPanelLoaded=false
$('.card-body.design-factory button.generate-contrasts').click(function(){
  let self=$(this)
  if(!statusPanelLoaded){
    self.closest('.card-body').siblings('.card-footer.calculate-de').find('button.calculate-de').click(calculateDE)
    $('.card.differential-expression .de-status .spinner-border').hide()
    let expandableEl=$('.card.differential-expression .fullscreen-able')
    addFullScreenButtons(expandableEl)
  }
  statusPanelLoaded=true
})

function addFullScreenButtons(expandableEl){
  expandableEl.each(function(){
    let self=$(this)
    let button=makeButton({
        icon:"fullscreen",
        text:""
      },{
        class:"btn btn-sm",
        style:"position:absolute;top:5px;right:20px",
        title:"maximize/regular size"
      },{evt:"click",callback:toggleSize})
    self.children().first().append(button)  
  })
  
}
function toggleSize(){
  let self=$(this)
  let target=self.closest('.fullscreen-able')
  if(maximized(target)){
    shrink(target)
  }else{
    grow(target)
  }
  function maximized(target){
    return target.hasClass('maximized')  
  }
  function grow(target){
    //find element that has class started with col
    let regularSizeClass=extractSizeClass(target)
    let bigClass=regularSizeClass.replace(/[0-9]*$/,12)
    target.addClass(bigClass+' maximized').removeClass(regularSizeClass)
    target.attr("regularSizeClass",regularSizeClass)
  }
  function shrink(target){
    let regularSizeClass=target.attr('regularSizeClass')
    let bigClass=extractSizeClass(target)
    target.removeClass(bigClass+' maximized').addClass(regularSizeClass)
  }
  function extractSizeClass(target){
    return target.attr('class').split(" ").find(el=> el.startsWith('col'))
  }
}
function openConnection(protocol){
  let port="8080"
  let hostname=document.location.hostname
  let address=`${(hostname=="localhost" ? "ws" : "wss")}://${hostname}:${port}`
  startWebSocket(address,protocol,callback)
}

function callback(incoming){
  if(isBlob(incoming)){    
    processAccordingToManifest(incoming)
  }else{
    if(incoming.startsWith("Error:")){
      makeToolTipNotification("Container Error!",incoming.replace(/^(Error: )*/g,""))
    }else if(incoming=="Container removed!"){
      $('.card.differential-expression .de-status .spinner-border').hide()
      $('.card.differential-expression .de-status .status-text').text("Analysis Finished!")      
    }else if(incoming.startsWith('{"manifest"')){
      let manifest=JSON.parse(incoming).manifest
      //validate previous manifest?
      activeManifest={manifest,promises:[]}
    }else{
      $('.card.differential-expression .de-status .spinner-border').show()  //TODO Possible changes
      $('.card.differential-expression .de-status .status-text').text(incoming)    
    }
  }

  function processAccordingToManifest(incoming){
    if(validate(activeManifest,incoming)){
      activeManifest.promises.push(incoming.arrayBuffer())
      if (activeManifest.manifest.length==0){
        Promise.all(activeManifest.promises).then(bufferList=>{
          assembleStream(bufferList)
        })
      }
    }      
  }
  function validate(activeManifest,stream){
    let manifest=activeManifest.manifest.shift()
    return manifest.length==stream.size
    
    //slice stream.stream.slice(equivalent size)
    //encode.base64(slice) compare with slice in manifest
  }
  function assembleStream(bufferList){  
    let assembledArrayBuffer=bufferList[0]
    bufferList.forEach((buffer,idx)=>{
      if (buffer instanceof ArrayBuffer)
        if(idx>0) assembledArrayBuffer=_appendBuffer(assembledArrayBuffer,buffer)
    })
    extractArchiveInArrayBuffer(assembledArrayBuffer).then(extractedFile=>{
      loadExtractedFile(extractedFile)
    })
  } 
  function loadExtractedFile(extractedFile){  
    let filetype=determineFiletypeByExtension(extractedFile.name)
    if(filetype=="svg"){
      let destination=$(`.card.differential-expression .file-container[filename|="${extractedFile.name}"]`)
      destination.find('svg').remove()
      encodeObjectAsText(destination,extractedFile)
      destination.find('svg').removeAttr('width')
      destination.find('svg').removeAttr('height')
    }else if(filetype=="image"){
      let destination=$(`.card.differential-expression .file-container[filename|="${extractedFile.name}"]`)
      let alternativeText=destination.find('p').text()
      let image = mkel("img",{width:"100%",alt:alternativeText})
      destination.find('img').remove()
      encodeImageAsObjectUrl(image,destination,extractedFile)    
    }else if(filetype=="table"){
      if(extractedFile.name=="topTags.tsv"){
        let destination=$('.card.differential-expression table.top-tags')
        convertToTable(extractedFile.readAsString(),destination)      
      }else if(extractedFile.name=="summary.tsv"){
        let destination=$('.card.differential-expression table.summary-de')
        loadSummaryTable(extractedFile.readAsString(),destination)
      }

    }
  }
  function isBlob(incoming){
    return (incoming instanceof Blob);
  }
  function encodeImageFromBlob(image,destination,blob){
    let reader=new FileReader()
    reader.addEventListener('loadend',()=>{
      let contents=reader.result
      image.src = contents
      destination.append(image)  
    })
    reader.readAsDataURL(blob)
  }
  function encodeImageAsObjectUrl(image,destination,extractedFile){
    image.src = extractedFile.getBlobUrl()
    destination.append(image)
  }
  function encodeObjectAsText(destination,extractedFile){
   let contents=extractedFile.readAsString()
   destination.append(contents)   
  }
  function determineFiletypeByExtension(filename){
    let fileTypes={
      image:["png","jpeg","jpg","bmp"],
      table:["tsv","csv"],
      svg:["svg"]
    }
    let extension=fileExtension(filename)
    let filetype=null 
    Object.keys(fileTypes).forEach(type=>{
      if(fileTypes[type].includes(extension)) filetype=type 
    })
    return filetype
  }  
  function extractArchiveInArrayBuffer(arrayBuffer){
    return new Promise((res,rej)=>{
      untar(arrayBuffer).progress(prog=>{
        console.log(prog)
      }).then(
        untared=>{
          console.log(untared[0].getBlobUrl())
          res(untared[0])
        },err=>{
            rej(err)
        },extractedFile=>{
            
        }
      )
    })
  }
  function fileExtension(filename){
    return filename.split(".").pop()
  }

  //Helpers
  function hexToBase64(hexstring) {
    return btoa(hexstring.match(/\w{2}/g).map(function(a) {
        return String.fromCharCode(parseInt(a, 16));
    }).join(""));
  }
  function convertFromHex(hex) {
    var hex = hex.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }
  function convertToHex(str) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += ''+str.charCodeAt(i).toString(16);
    }
    return hex;
  }  
}
function makeToolTipNotification(title, msg) {
    let body=mkel('p')
    body.textContent=msg
    $('.toast').toast('dispose')
    let toast = makeToast(title, body)
    $('.toaster').append(toast)
    $('.toaster .toast').last().find('.toast-header').css('background-color','#d32626').css('color',"white")
    $('.toaster .toast').last().on('hide.bs.toast', function() {
      $(this).remove()
    })
    $('.toast').toast('show')
  }

})
function loadSummaryTable(data,target){
  let lines=data.split("\n")
  possibleValues=["up","notsig","down"]
  lines.forEach((line,index)=>{
      actionForLine(possibleValues,line,target)
    
  })
  function actionForLine(possibleValues,line,target){
    line=line.split("\t")
    let state=line[0].toLowerCase().replace(/"/g,"")
    possibleValues.includes(state) ? target.find(`tr.${state} td.value`).text(line[1]) : null
  }
}
function convertToTable(data,target){
  let lines=data.split('\n')
  let header=lines.shift().split("\t")
  let metadata=[]
  header.unshift("Sequence")
  header.forEach(col=>{
    metadata.push({
      colname:col.replace(/"/g,"")
    })
  })
  lines.forEach(line=>{
    line=line.split('\t')
    if(line.length==header.length){
      let row=makeRow({sequence:line[0]},line,metadata)
      target.find("tbody").append(row)
    }
  })

  let actions={
    Sequence:{function:unquote,params:null},
   	logFC:{function:formatFloat,params:2},
   	logCPM:{function:formatFloat,params:2},
   	F:{function:formatFloat,params:2},
   	PValue:{function:formatScientific,params:null},
   	FDR:{function:formatScientific,params:null}
  }
  formatTable(target,actions)
  function formatTable(table,actions){
    table.find('tbody tr').each(function(){
      let row=$(this)
      row.find('td').each(function(){
        let cell=$(this)
        let id=cell.attr('colname')
        if(actions[id]){
          let params=actions[id].params
          let data=cell.text()
        cell.attr('title',data)
          let formatedText=actions[id].function(data,params)
          cell.text(formatedText)
        }
      })
    })
  }
    
  function unquote(text){
    return text.replace(/"/g,"")
  }
  function formatDate(date,param){
      return date.replace(/\.[0-9]*Z/,"").replace("T"," ")
  }
  function formatScientific(float){
    return parseFloat(float).toExponential(2)
  }
  function formatFloat(float,decimalNumbers){
      decimalNumbers=decimalNumbers || 0
      return Math.round10(parseFloat(float),-decimalNumbers)
  }
  function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
  }
}
  /**
   * Creates a new Uint8Array based on two different ArrayBuffers
   *
   * @private
   * @param {ArrayBuffers} buffer1 The first buffer.
   * @param {ArrayBuffers} buffer2 The second buffer.
   * @return {ArrayBuffers} The new ArrayBuffer created out of the two.
   */
  var _appendBuffer = function(buffer1, buffer2) {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
  };
