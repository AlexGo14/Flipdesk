var express = require('express');
var router = express.Router();
var utility = require('./utility');

router.get('/', utility.requireAuthentication, function(req, res) {
	knex.select().from('customer').then(function(rows) {
			res.render('administration', { title: 'Tickets', company: nconf.get('company').name,
				customers: rows
			});
	});
});

router.get('/settings', utility.requireAuthentication, function(req, res) {
	res.render('administration-settings', {});
});

router.get('/agents', utility.requireAuthentication, function(req, res) {
	res.render('administration-agent', {});
});

router.get('/customer/:id', utility.requireAuthentication, function(req, res) {
	res.render('administration-customer', {});
});

router.get('/customer/add', utility.requireAuthentication, function(req, res) {
	res.render('administration-add', {});
});

module.exports = router;
