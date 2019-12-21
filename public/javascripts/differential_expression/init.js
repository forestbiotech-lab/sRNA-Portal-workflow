$(document).ready(function(){


var pathname=document.location.pathname
var paths=pathname.split("/").splice(1)

  scriptName=[
    'helpers',
    'ajax',
    'parser',
    'savetodb',
    'infinityLoader',
    'infinityLoaderAPI',
  //  'setters',
  //   'getters',
  //   'DOMbasics',
  //   'listeners'
  ]
  if(paths[1]=="assaydata"){
     scriptName=[
      'infinityLoaderAPI',
      'helpers',
      'assaydata'
    ]
  }



  scriptTarget = $('script#actions')[0];
  for (s in scriptName){
    let url="/javascripts/differential_expression/"+scriptName[s]+".js";
    let script = document.createElement('script');
    script.src = url;
    scriptTarget.parentNode.insertBefore(script, scriptTarget);
  }



});





