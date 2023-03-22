let scriptTarget=document.getElementById('actions')
var pathname=document.location.pathname
var paths=pathname.split("/").splice(1)
let url

if (paths[0]==="admin"){
    if (paths[1]==="database"){
        url="/javascripts/admin/database/init.js";
    }
}else if(paths[0]==="viewers"){
    if(paths[1]=="view")
        url="/javascripts/viewers/init.js";
}else if(paths[0]=="de"){
    url="/javascripts/differential_expression/init.js"
}else{
    url="/javascripts/auth/init.js";
}


var script = document.createElement('script');
if(url !== undefined){
    script.src = url;
    scriptTarget.parentNode.insertBefore(script, scriptTarget);
}
