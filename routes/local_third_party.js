var express = require('express');
var router = express.Router();

//Javascript
//Still in testing
const vSelect= require('vue-select')


//CSS
//const css_vSelect=require('vue-select/dist/vue-select.css')



router.get('/javascripts/v-select.js',(req,res)=>{
    res.send(vSelect)
})
router.get('/javascripts/canvas-datagrid.js',(req,res)=>{
    res.send()
})


router.get('/stylesheets/v-select')



module.exports = router;