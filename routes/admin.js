const express = require('express');
const router = express.Router();
const {authenticate} = require('../components/auth/authenticate')
const {isAdmin} = require("../components/auth/roles");
const gmail = require('./../components/auth/gmail')
const authorize = require('./../components/auth/authorize')
const getSequenceAssemblies = require('./../components/miRNADB/getSequence_assemblies')


router.get("/database",(req,res)=>{

    getSequenceAssemblies().then(data=> {
        res.render('admin/database/index', data)
    }).catch(e=> {
        res.render('error', e)
    })
})




module.exports = router;