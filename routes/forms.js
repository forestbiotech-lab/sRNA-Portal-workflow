var express = require('express');
var router = express.Router();
var getTableAttr=require('./../components/forms/formFromTable')
var saveSingleTableDynamic=require('./../components/forms/saveSingleTableDynamic') 
var formElementSelect=require('./../components/forms/formElementSelect')
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
router.post('/factory/select/basic/:table', function(req, res, next){
  let options={tablename:req.params.table,attributes:req.body.attributes}
  formElementSelect(options).then(function(data){
  	data instanceof Error? res.render('error',{error:data}) : res.render('factory/select-form',{entries:data,attributes:req.body.attributes,name:req.params.table});
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
router.post('/update/singletable/:tablename',function(req,res){
  let options={inserts:req.body,tablename:req.params.tablename}
    saveSingleTableDynamic.update(options).then(function(data){
    data instanceof Error ? res.render('error',{error:data}) : res.redirect('back')
  }).catch(function(error){
    res.render('error',error)
  })
})

module.exports=router