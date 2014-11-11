var express = require('express');
var router = express.Router();
var utility = require('./utility');
var moment = require("moment-timezone");
var generatePassword = require('password-generator');
var bcrypt = require('bcrypt');
var mailFunction = require('./mail');

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

/* Adds agent */
router.post('/agents', utility.requireAuthentication, function(req, res) {
	
	//Insert into db
	knex('agent').returning('id').insert({
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		email: req.body.email,
		is_admin: req.body.is_admin,
		active: req.body.active,
		password: 'async'
	}).then(function(rows) {
		var agent_id = rows[0];
		
		//Generate salt, random password and hash async
		//This function processes async to give the user a fast response. He does not have to wait
		//for generating a salt, password and updating the db.
		bcrypt.genSalt(10, function(err, salt) {
			var gen_password = generatePassword(12, false);
			
			bcrypt.hash(gen_password, salt, function(err, hash) {
				
				//Update agent object
				knex('agent').where({
					id: agent_id
				}).update({
					password: hash
				}).then(function(rows) {
					
					//Loads id of new agent object and sends email
					knex('agent').select()
						.where({'id': agent_id})
						.then(function(rows) {
							
							//Send welcome email
							mailFunction.sendAgentWelcomeEmail(rows[0].first_name, rows[0].last_name, rows[0].email, gen_password);
						})
						.catch(function(err) {
							console.log(err);
						});
						
				}).catch(function(err) {
					console.log(err);
				});
			});
		});
		
		
		res.json( { 'success': true } );
	}).catch(function(err) {
		console.log(err);
		
		res.json( { 'success': false } );
	});
});

/* Updates agent */
router.post('/agents/:id', utility.requireAuthentication, function(req, res) {
	
	knex('agent').update({
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		email: req.body.email,
		is_admin: req.body.is_admin,
		active: req.body.active,
		update_timestamp: moment().format()
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
	
	knex('customer').select('id', 'name', 'email_contact', 'create_timestamp', 'update_timestamp',
		'fk_created_by_admin', 'active').where({
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
					{'name': customer.name, 'id': customer.id, 'users': customer.users, 'active': customer.active,
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

/* Disable customer */
router.delete('/customer/:id', utility.requireAuthentication, function(req, res) {
	knex('customer').update({
		active: false
	}).where({
		id: req.params.id
	}).then(function(rows) {
		res.json({'success': true});
	}).catch(function(err) {
		res.json({'success': false});
	});
});

/* Enable customer */
router.put('/customer/:id', utility.requireAuthentication, function(req, res) {
	knex('customer').update({
		active: true
	}).where({
		id: req.params.id
	}).then(function(rows) {
		res.json({'success': true});
	}).catch(function(err) {
		res.json({'success': false});
	});
});

/* Update customer */
router.post('/customer/:id', utility.requireAuthentication, function(req, res) {
	knex('customer').returning('id').update({
		'name': req.body.name
	}).where({
		'id': req.params.id
	}).then(function(id) {
		if(id > 0) {
			res.json({'success': true});
		} else {
			res.json({'success': false});
		}
	}).catch(function(err) {
		res.json({'success': false});
	});
});

/* Add user */
router.post('/user', utility.requireAuthentication, function(req, res) {
	
	//Insert into db
	knex('user').returning('id').insert({
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		email: req.body.email,
		active: req.body.active,
		password: 'async',
		fk_customer_id: req.body.customer_id,
		create_timestamp: moment().format()
	}).then(function(rows) {
		var user_id = rows[0];
		
		//Generate salt, random password and hash async
		//This function processes async to give the user a fast response. He does not have to wait
		//for generating a salt, password and updating the db.
		bcrypt.genSalt(10, function(err, salt) {
			var gen_password = generatePassword(12, false);
			
			bcrypt.hash(gen_password, salt, function(err, hash) {
				
				//Update agent object
				knex('user').where({
					id: user_id
				}).update({
					password: hash
				}).then(function(rows) {
					
					//Loads id of new agent object and sends email
					knex('user').select()
						.where({'id': user_id})
						.then(function(rows) {
							
							//Send welcome email
							mailFunction.sendUserWelcomeEmail(rows[0].first_name, rows[0].last_name, rows[0].email, gen_password);
						})
						.catch(function(err) {
							console.log(err);
						});
						
				}).catch(function(err) {
					console.log(err);
				});
			});
		});
		
		
		res.json( { 'success': true, 'id': user_id, 'last_name': req.body.last_name, 
			'first_name': req.body.first_name, 'email': req.body.email } );
	}).catch(function(err) {
		console.log(err);
		
		res.json( { 'success': false } );
	});
});

/* Edit user */
router.post('/user/:id', utility.requireAuthentication, function(req, res) {
	
	knex('user').returning('id').update({
		'first_name': req.body.first_name,
		'last_name': req.body.last_name,
		'email': req.body.email
	}).where({
		id: req.params.id
	}).then(function(id) {
		res.json({'success': true});
	}).catch(function(err) {
		console.log(err);
		res.json({'success': false});
	});
	
});

module.exports = router;
