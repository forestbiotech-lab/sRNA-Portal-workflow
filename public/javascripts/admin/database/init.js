$(document).ready(function(){


    var pathname=document.location.pathname
    var paths=pathname.split("/").splice(1)
    scriptName=[]

    if(paths[1]=="database"){
        scriptName=[
            'data',
            'main'

        ]
    }

    scriptTarget = $('script#actions')[0];
    scriptName.forEach(scriptName=>{
        let url=""
        if(isName(scriptName)){
            url="/javascripts/admin/database/"+scriptName+".js";
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
