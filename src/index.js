//const wp=require(".././webpack.config")
//console.log(wp)
import Vue from 'vue/dist/vue.esm.browser';
import {VueSelect} from "vue-select";
function insertScripts(names) {
  let collection=[]
  for(let name of names) {
    let element = document.createElement('script');
    element.src = "/webpack/"+name+".js"
    document.body.appendChild(element)
  }
}
//let names=webpack.entry.map(pkg=>pkg.filename)
let names=["vue","popper","bootstrap","canvas-datagrid","genoverse",'cookieconsent']
insertScripts(names);

window.Vue = Vue
window.VueSelect=VueSelect