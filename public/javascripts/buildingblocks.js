function makeButton(content,classlist,action){
  let button=document.createElement('button')
  button.className=classlist
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
function mkel(name,attributes){
  let el=document.createElement(name)
  if(attributes){
    Object.keys(attributes).forEach(key=>{
      let value=attributes[key]
      el.setAttribute(key,value)
    })
  }
  return el
}
function makeRow(attributes,contents,metadata,header){
  let tr=mkel('tr',attributes)
  if(contents instanceof Array){
    contents.forEach(content=>{
      let cell=mkel((header?"th":"td"),metadata)
      cell.append(content)
      tr.append(cell)
    }) 
  }
  return tr
}