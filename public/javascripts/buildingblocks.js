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

