var express = require('express');
var router = express.Router();



/* GET sequences search */
router.get('/sequence', function(req, res, next) {
  var errMsg="API Router /sequence get - "
  var call=sequenceSearch
  resolveCall(call,req,res,errMsg)  
});





module.exports = router;