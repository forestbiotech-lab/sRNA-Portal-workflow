$(document).ready(function(){


    var pathname=document.location.pathname
    var paths=pathname.split("/").splice(1)
    scriptName=[]

    if(paths[0]=="viewers"){
        if(paths[1]=="view")
            if(paths[2]=="table"){
                scriptName=[
                    'data',
                    'main'

                ]
            }else if(paths[2]=="row"){
                scriptName=[
                    'dataRow',
                    'mainRow'

                ]
            }
    }

    scriptTarget = $('script#actions')[0];
    scriptName.forEach(scriptName=>{
        let url=""
        if(isName(scriptName)){
            url="/javascripts/viewers/"+scriptName+".js";
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
