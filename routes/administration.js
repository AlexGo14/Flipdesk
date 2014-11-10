var express = require('express');
var router = express.Router();
var utility = require('./utility');
var moment = require("moment-timezone");

/* Renders general administration view */
router.get('/', utility.requireAuthentication, function(req, res) {
	knex.select().from('customer').then(function(rows) {
			res.render('administration', { title: 'Tickets', company: nconf.get('company').name,
				customers: rows
			});
	});
});

/* Renders administration/settings view */
router.get('/settings', utility.requireAuthentication, function(req, res) {
	
	res.render('administration-settings', {'global_name': nconf.get('company').name, });
});

/* Updates company name */
router.post('/settings/update', utility.requireAuthentication, function(req, res) {
	
	if(req.body.company_name != undefined) {
		nconf.set('company:name', req.body.company_name);
		
		nconf.save(function(err) {
			if(err) {
				console.log('Could not save company name.');
				res.json( { 'success': false } );
				return;
			}
			
			res.json( { 'success': true } );
			
		});
	} else {
		
		res.json( { 'success': false } );
	}
	
});

/* Renders administration/agents view */
router.get('/agents', utility.requireAuthentication, function(req, res) {
	knex('agent').select().orderBy('id', 'asc')
	.then(function(rows) {
		var agent = [];
		for(var i = 0; i < rows.length; i++) {
			agent[i] = {
				id: rows[i].id,
				last_name: rows[i].last_name,
				first_name: rows[i].first_name,
				email: rows[i].email,
				active: rows[i].active
			};
		}
		
		res.render('administration-agent', {'agents': agent } );
	})
	.catch(function(err) {
		console.log(err);
	});
	
});

/* Loads agent details and returns json data */
router.get('/agents/:id', utility.requireAuthentication, function(req, res) {
	knex('agent').select().where({
		id: req.params.id
	})
	.then(function(rows) {
		if(rows.length == 1) {
			res.json( { 'agent': rows[0] } );
		}
	})
	.catch(function(err) {
		console.log(err);
	});
});

/* Updates agent */
router.post('/agents/:id', utility.requireAuthentication, function(req, res) {
	
	knex('agent').update({
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		email: req.body.email,
		is_admin: req.body.is_admin,
		active: req.body.active
	}).where({
		id: req.params.id
	}).then(function(rows) {
		
		res.json( { 'success': true } );
	}).catch(function(err) {
		console.log(err);
		
		res.json( { 'success': false } );
	});
	
});

/* Loads customer details and returns json data */
router.get('/customer/:id', utility.requireAuthentication, function(req, res) {
	var customer = {};
	
	knex('customer').select().where({
		id: req.params.id
	})
	.then(function(rows) {
		
		customer = rows[0];
		
		knex('user').select(
			'user.id', 'user.first_name', 'user.last_name', 'user.email', 
				'user.create_timestamp', 'user.update_timestamp')
		.where({
			'user.fk_customer_id': req.params.id
		})
		.orderBy('user.id', 'asc')
		.then(function(rows) {
			console.log(rows);
			
			customer.users = rows;
			for(var i = 0; i < customer.users.length; i++) {
				if(customer.users[i].update_timestamp == null || customer.users[i].update_timestamp == undefined) {
					customer.users[i].update_timestamp = false;
				} else {
					customer.users[i].update_timestamp = moment(customer.users[i].update_timestamp).tz("Pacific/Auckland").format('Do MMMM YYYY, h:mm a');
				}
			}
			
			knex('blacklist').select().then(function(rows) {
				
				res.render('administration-customer', 
					{'name': customer.name, 'id': customer.id, 'users': customer.users, 
						'blacklist': rows });
			}).catch(function(err) {
				
			});
		})
		.catch(function(err) {
			console.log(err);
		});
		
		
	})
	.catch(function(err) {
		
	});
	
});

/* Renders "administration-add" view */
router.get('/customer', utility.requireAuthentication, function(req, res) {

	res.render('administration-add', {});
});


module.exports = router;
