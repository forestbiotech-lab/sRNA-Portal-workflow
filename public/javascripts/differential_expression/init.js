$(document).ready(function(){


var pathname=document.location.pathname
var paths=pathname.split("/").splice(1)

  scriptName=[
    'helpers',
    'ajax',  //load matrix. route:/de and one function for assay 
    'parser',
    'tableFunctions'
  ]

  if(paths[1]=="uploaded-file"){
     scriptName=[
      'helpers',
      'uploaded-file', //must load first because sets global studyId
      'infinityLoader',
      'savetodb',
    ]
  }
  if(paths[1]=="assays"){
     scriptName=[
      'helpers',
      'assay',
    ]
  }
  if(paths[1]=="assaydata"){
     scriptName=[
      'helpers',
      'infinityLoaderAPI',
      'assaydata',
      '../scoring/getBestOption'
    ]
  }
  if(paths[1]=="targets"){
     scriptName=[
      'saveTargetToDB',
      'tableFunctions',
      'tableAssociation'
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





