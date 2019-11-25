let scriptTarget=document.getElementById('actions')
let url="/javascripts/differential_expression/init.js";
let script = document.createElement('script');
script.src = url;
scriptTarget.parentNode.insertBefore(script, scriptTarget);