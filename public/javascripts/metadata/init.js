var pathname=document.location.pathname
var paths=pathname.split("/").splice(1)
  scriptName=[]

  if(paths[1]=="sequence"){
     scriptName=[
     'loader'
    ]
  }
  if(paths[1]=="list"){
     scriptName=[
      '/../javascripts/thirdparty/password-strength-meter/password.min.js',
      'register'
    ]
  }


  scriptTarget = $('script#actions')[0];
  scriptName.forEach(scriptName=>{
    let url=""
    if(isName(scriptName)){
      url="/javascripts/metadata/"+scriptName+".js";
    }else{
      url=scriptName
    }
    let script = document.createElement('script');
    script.id="metadata"
    script.src = url;
    scriptTarget.parentNode.insertBefore(script, scriptTarget);
  })

function isName(script){
  return script.split("/").length==1
}








