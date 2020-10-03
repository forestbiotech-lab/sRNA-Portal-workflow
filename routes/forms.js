var express = require('express');
var router = express.Router();
var getTableAttr=require('./../components/forms/formFromTable')
var saveSingleTableDynamic=require('./../components/forms/saveSingleTableDynamic') 
var formElementSelect=require('./../components/forms/formElementSelect')
var tableFromTable=require('./../components/forms/tableFromTable')
var countAssociatedTables=require('./../components/forms/countAssociatedTables')
const tailorMultiTableLookup=require('./../components/forms/tailorMultiTableLookup')
var Cookies = require('cookies');
var Keygrip = require("keygrip");
const keylist=require('./../.config_res').cookie.keylist
const keys = new Keygrip(keylist,'sha256','hex')
const token=require('./../.config_res').cookie.seed
const Auth = require('node_auth_module')
const authModule = new Auth(".config_auth.js")

const limitedAccessTables=["Study"]
//Security issues? this might allow rendering pages that it shouldn't allow.
router.get('/factory/:template', function(req, res, next){
  res.render('factory/'+req.params.template);
})
router.get('/factory/fromTable/basic/:table', function(req, res, next){
  let table=req.params.table
  table=getTableAttr.tableStructure(table)
  res.render('factory/basic-form',{table,name:req.params.table});
})
router.get('/factory/fromTable/fks/:table', function(req, res, next){
  let table=req.params.table
  table=getTableAttr.tableStructure(table)
  //get values
  res.render('factory/lookupFK-form',{table,name:req.params.table});
})
router.get('/factory/fromTable/byId/:table/:id',function(req,res){
  let tablename=req.params.table
  let id=req.params.id
  let options={tablename,where:{id}}
  getTableAttr.tableEntry(options).then(function(data){
    data instanceof Error ? res.render('error',{error:data}) : res.json(data);
  }).catch(function(error){
    res.render('error',error)
  })
})
router.post('/factory/tailored-query/',(req,res)=>{
  try{
    let sourceTable=req.body.sourceTable
    let tableConnections=req.body.tableConnections
    let callOutputStructure=req.body.callOutputStructure
    tailorMultiTableLookup(sourceTable,tableConnections,callOutputStructure).then(data=>{
      res.json(data)
    }).catch(err=>{
      let message=err.message
      res.writeHead( 500, message, {'content-type' : 'text/plain'});
      res.end(message);
    })
  }catch(err){
    let message=err.message
    res.writeHead( 500, message, {'content-type' : 'text/plain'});
    res.end(message);
  }
})
router.post('/factory/select/basic/:table', function(req, res, next){
  let options={tablename:req.params.table,attributes:req.body.attributes}
  formElementSelect(options).then(function(data){
  	data instanceof Error? res.render('error',{error:data}) : res.render('factory/select-form',{entries:data,attributes:req.body.attributes,name:req.params.table});
  }).catch(function(error){
    res.render('error',error)
  })
})
router.get('/factory/table/basic/:table', async function(req, res, next){
  let tablename=req.params.table
  let attributes=req.body.attributes || {}
  if(limitedAccessTables.includes(tablename)){
    var cookies = new Cookies( req, res, { "keys": keys } ), unsigned, signed, tampered;
    let userId=cookies.get('user-id',{signed:true})
    let person=await authModule.auth.getUserInfo(parseInt(userId))
    let responsible=person.id
    attributes=Object.assign(attributes,{where:{responsible}})
  }
  let options={tablename,attributes}
  tableFromTable(options).then(function(data){
    data instanceof Error? res.render('error',{error:data}) : res.render('factory/tableFromTable',{entries:data,attributes:req.body.attributes,name:req.params.table});
  }).catch(function(error){
    res.render('error',error)
  })
})
router.post('/save/singletable/:tablename',function(req,res){
  let options={inserts:req.body,tablename:req.params.tablename}
  saveSingleTableDynamic.create(options).then(function(data){
    data instanceof Error ? res.render('error',{error:data}) : res.redirect('back')
  }).catch(function(error){
    res.render('error',error)
  })
})
router.post('/create/entry/:tablename',function(req,res){
  let options={inserts:req.body,tablename:req.params.tablename}
  saveSingleTableDynamic.create(options).then(function(data){
    data instanceof Error ? res.status(304).json({error:data}) : res.json(data)
  }).catch(function(error){
    res.status(300).json(error)
  })
})
router.post('/update/entry/:tablename',function(req,res){
  let options={inserts:req.body,tablename:req.params.tablename}
  saveSingleTableDynamic.update(options).then(function(data){
    data instanceof Error ? res.status(304).json({error:data}) : res.json(data)
  }).catch(function(error){
    res.status(300).json(error)
  })
})
router.post('/destroy/entry/:tablename',function(req,res){
  let options={inserts:req.body,tablename:req.params.tablename}
  saveSingleTableDynamic.destroy(options).then(function(data){
    data instanceof Error ? res.status(304).json({error:data}) : res.json(data)
  }).catch(function(error){
    res.status(300).json(error)
  })
})
router.post('/update/singletable/:tablename',function(req,res){
  let options={inserts:req.body,tablename:req.params.tablename}
    saveSingleTableDynamic.update(options).then(function(data){
    data instanceof Error ? res.render('error',{error:data}) : res.redirect('back')
  }).catch(function(error){
    res.render('error',error)
  })
})

router.post('/count/associatedTables',function(req,res){
  let tablename=req.body.tablename
  let associatedTable=req.body.associatedTable
  let id=req.body.tableId 
  countAssociatedTables(tablename,associatedTable,id).then(function(data){
    res.json(data)
  },rej=>{
    res.status(404).json(rej)
  }).catch(function(error){
    res.status(404).json(error)
  })
})

module.exports=router