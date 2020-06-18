/**
@param {object}         content       text and icon
@param {string/object}  attributes    button class or/ list of attributes
@param {object}         action        [Optional] Action for button
**/
function makeButton(content,classlist,action){
  let button=document.createElement('button')
  if (typeof classlist == "string"){ 
    button.className=classlist 
  }else if(typeof classlist == "object"){
    let attributes=classlist
    Object.keys(attributes).forEach(key=>{
      let value=attributes[key]
      button.setAttribute(key,value)
    })
  }  
  button.textContent=" "+content.text
  if(content.icon){
    let span=document.createElement('span')
    span.className=`glyphicon glyphicon-${content.icon}`
    button.prepend(span)
  }
  if(action){
    button.addEventListener(action.evt,action.callback)
  }
  return button
}
function makeInput(attributes,classList){
  let input=document.createElement('input')
  attributes
}
function mkel(name,attributes,append){
  let el=document.createElement(name)
  if(attributes){
    Object.keys(attributes).forEach(key=>{
      let value=attributes[key]
      el.setAttribute(key,value)
    })
  }
  if(append){
    append.append(el)
    return el  
  }else{
    return el  
  }
}
/**
@param {object}       attribtues  Tr attributes
@param {array}        contents    Cell contents
@param {array/object} metadata    cell attributes
@param {boolean}      header      optional, idicates wheather this row is a header or not.
**/
function makeRow(attributes,contents,metadata,header){
  let tr=mkel('tr',attributes)
  if(contents instanceof Array){
    contents.forEach((content,index)=>{
      if(metadata instanceof Array && metadata.length != contents.length ) metadata={}
      let cell=mkel((header?"th":"td"),(metadata instanceof Array ? metadata[index] : metadata))
      cell.append(content)
      tr.append(cell)
    }) 
  }
  return tr
}
function makeToast(title,body){
  let toast=mkel('div',{class:"toast",role:"alert","aria-live":"assertive","aria-atomic":"true","data-delay":"20000"})
  let toastHeader=mkel('div',{class:"toast-header"})
  let toastBody=mkel('div',{class:"toast-body"})
  toast.append(toastHeader)
  toast.append(toastBody)

  let img=mkel('img',{class:"rounded mr-2",src:"...",alt:"..."})
  let strong=mkel('strong',{class:"mr-auto"})
  let small=mkel('small',{class:"text-muted"})
  strong.textContent=title
  small.textContent='just now'
  let buttonClose=mkel('button',{class:"ml-2 mb-1 close",type:"button","data-dismiss":"toast","aria-label":"Close"})
  let span=mkel("span",{"aria-hidden":'true'})
  span.textContent="x"
  buttonClose.append(span)
  toastHeader.append(strong)
  toastHeader.append(small)
  toastHeader.append(buttonClose)
  toastBody.append(body)
  return toast
}
function makeSelect(attributes,options){
  let select=mkel('select',attributes)
  options.forEach(option=>{
    let selectOption=mkel('option',option)
    selectOption.textContent=option.name
    select.append(selectOption)
  })
  return select
}

function makeModal(titleText,bodyContent){
  let modalPocket=mkel('div',{class:"modal-pocket"})
  let root=mkel('div',{class:"modal new-table-entry",tabindex:"-1",role:"dialog"})
  let dialog=mkel('div',{class:"modal-dialog",role:"document"})
  let content=mkel('div',{class:"modal-content"})
  let header=mkel('div',{class:"modal-header"})
  let title=mkel('h5',{class:"modeal-title"})
  let button=mkel('button',{
    type:"button",
    class:"close",
    "data-dismiss":"modal",
    "aria-label":"Close"
  })
  let span=mkel('span',{"aria-hidden":"true"})
  let body=mkel('div',{class:"modal-body"})
  let footer=mkel('div',{class:"modal-footer"})

  title.textContent=titleText
  span.textContent="x"

  root.append(dialog)
  dialog.append(content)
  content.append(header)
  content.append(body)
  content.append(footer)
  header.append(title)
  header.append(button)
  button.append(span)
  body.append(bodyContent)
  
  if($('.modal-pocket').length>0){
    $('.modal-pocket').html(root)
  }else{
    $('body').append(modalPocket)
    $('.modal-pocket').html(root)
  }

  $('.modal.new-table-entry').modal()
  return $('.modal.new-table-entry')
}

