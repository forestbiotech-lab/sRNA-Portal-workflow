$(document).ready(function(){

  scriptName=[
    'ajax'
   // 'parser',
//  'setters',
 //   'getters',
 //   'DOMbasics',
 //   'listeners'
  ]


  scriptTarget = $('script#actions')[0];
  for (s in scriptName){
    let url="/javascripts/differential_expression/"+scriptName[s]+".js";
    let script = document.createElement('script');
    script.src = url;
    scriptTarget.parentNode.insertBefore(script, scriptTarget);
  }



});





