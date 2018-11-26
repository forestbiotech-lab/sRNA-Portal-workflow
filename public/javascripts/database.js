let scriptTarget=document.getElementById('jquery')
let url="javascripts/database/init.js";
let script = document.createElement('script');
script.src = url;
scriptTarget.parentNode.insertBefore(script, scriptTarget);