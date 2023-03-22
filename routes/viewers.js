var express = require('express');
var router = express.Router();
var {publicTable}=require('./../components/auth/tableAccess')

router.get( "/" ,function(req,res,next){
	res.render('ViewerSecondaryStructure');
})


router.get('/view/table/:table',publicTable,(req,res)=>{
	//Limit
	res.render("viewers/table")
})

router.get('/view/row/:table/:pkColumn/:pk',publicTable,(req,res)=>{
	//Limit
	res.render("viewers/row")
})

module.exports = router;