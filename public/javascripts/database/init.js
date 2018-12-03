$(document).ready(function(){

  scriptName=[
    'loaders',
    'setters',
    'getters',
    'DOMbasics',
    'listeners',
    'sequence-viewer',
  ]


  scriptTarget = $('script#jquery')[0];
  for (s in scriptName){
    let url="/javascripts/database/"+scriptName[s]+".js";
    let script = document.createElement('script');
    script.src = url;
    scriptTarget.parentNode.insertBefore(script, scriptTarget);
  }



});





