$(document).ready(function(){

  let scriptName=[
    'loaders',
    'setters',
    'getters',
    'DOMbasics',
    'listeners',
    'sequence-viewer',
  ]

  var pathname=document.location.pathname
  var paths=pathname.split("/").splice(1)

  if(paths[1]=="organism"){
     scriptName=[
      'stats'
    ]
  }

  scriptTarget = $('script#actions')[0];
  for (s in scriptName){
    let url="/javascripts/database/"+scriptName[s]+".js";
    let script = document.createElement('script');
    script.src = url;
    scriptTarget.parentNode.insertBefore(script, scriptTarget);
  }



});





