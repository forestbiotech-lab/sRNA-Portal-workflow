var express = require('express');
var router = express.Router();

/// --------- Call Declaration ----------------------------------------
var sequenceSearch = require('./../components/miRNADB/sequenceSearch');
var nameSearch = require('./../components/miRNADB/nameSearch');

/// --------------End -------------------------------------------------



/* GET sequences search */
router.get('/sequence', function(req, res, next) {
  sequenceSearch(req.query)
  .then(function(sequenceSearchRes){
    res.status(200).json(sequenceSearchRes);
  }).catch(function(err){
    var statusCode;
    try{
      statusCode=err.metadata.status[0].code;
    }
    catch(error){
      statusCode=500;
    }
    res.status(statusCode).json(err.err);
  })
});

/* GET names search */
router.get('/name', function(req, res, next) {
  nameSearch(req.query)
  .then(function(nameSearchRes){
    res.status(200).json(nameSearchRes);
  }).catch(function(err){
    var statusCode;
    try{
      statusCode=err.metadata.status[0].code;
    }
    catch(error){
      statusCode=500;
    }
    res.status(statusCode).json(err.err);
  })
});


module.exports = router;
