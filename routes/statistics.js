var express = require('express');
var router = express.Router();
var utility = require('../packages/utility');
var nconf = utility.configureNconf();
var database = require('../packages/database');

router.get('/', utility.requireAuthentication, function(req, res) {
	knex.select().from('customer').then(function(rows) {
		res.render('statistics', { title: 'Tickets', company: nconf.get('company').name,
			customers: rows
		});
	});
});

module.exports = router;
