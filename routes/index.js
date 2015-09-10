var express = require('express');
var router = express.Router();
var utility = require('../packages/utility');
var nconf = utility.configureNconf();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: nconf.get('company').name });
});

module.exports = router;
