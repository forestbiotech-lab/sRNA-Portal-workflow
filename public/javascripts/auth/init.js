$(document).ready(function(){


var pathname=document.location.pathname
var paths=pathname.split("/").splice(1)
  scriptName=[]

  if(paths[1]=="list"){
     scriptName=[
     'userManagement'
    ]
  }
  if(paths[1]=="register"){
     scriptName=[
      '/../javascripts/thirdparty/password-strength-meter/password.min.js',
      'register'
    ]
  }
  if(paths[1]=="login"){
     scriptName=[
      '/../javascripts/thirdparty/password-strength-meter/password.min.js',
      'register'
    ]
  }
  if(paths[1]=="profile"){
    scriptName=[
      "profile"
    ]
  }
  if(paths[0]==""){
    scriptName=[
      "login"
    ]
  }


  scriptTarget = $('script#actions')[0];
  scriptName.forEach(scriptName=>{
    let url=""
    if(isName(scriptName)){
      url="/javascripts/auth/"+scriptName+".js";
    }else{
      url=scriptName
    }
    let script = document.createElement('script');
    script.src = url;
    scriptTarget.parentNode.insertBefore(script, scriptTarget);
  })

function isName(script){
  return script.split("/").length==1
}



});


function googleCallback(){
  alert("New login")
}


