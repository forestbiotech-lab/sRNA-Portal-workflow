var express = require('express');
var router = express.Router();



/* GET sequences search */
router.get('/register', function(req, res, next) {
  res.render('auth/register', {})  
});





module.exports = router;