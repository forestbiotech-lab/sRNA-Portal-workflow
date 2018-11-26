
//DOM manipulation 
function cloneElement(element){
  return element.clone()
}

// Attributes
function changeAttrs(element,addAttrs,removeAttrs){
	setAttrs(element,addAttrs)
	rmAttrs(element,removeAttrs)
} 
function setAttrs(element,addAttrs){
  for (a in addAttrs){
    element.attr(addAttrs[a],"")
  }	
} 
function rmAttrs(element,rmAttrs){
  for (r in rmAttrs){
    element.removeAttr(rmAttrs[r])
  }      
}

// classes
function changeClasses(element,addClasses,removeClasses){
  setClasses(element,addClasses);
  rmClasses(element,removeClasses);
}
function setClasses(element,addClasses){
  for (a in addClasses){
    element.addClass(addClasses[a])
  }  
}
function rmClasses(element,rmClasses){
  for (r in rmClasses){
    element.removeClass(rmClasses[r])
  }
}

