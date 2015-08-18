var express = require('express');
var router = express.Router();
var utility = require('./utility');
var generatePassword = require('password-generator');
var mailPackage = require('../packages/mail');

/* Renders general administration view */
router.get('/', utility.requireAuthentication, function(req, res) {
	utility.getCustomers(function(customers) {
		res.render('administration', { title: 'Tickets', company: nconf.get('company').name,
			customers: customers
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
	utility.getAgents(function(agents) {
		res.render('administration-agent', {'agents': agents } );
	});
});

/* Loads agent details and returns json data */
router.get('/agents/:id', utility.requireAuthentication, function(req, res) {
	utility.getAgent(req.params.id, function(agent) {
		res.json( { 'agent': agent } );
	});
});

/* Adds agent */
router.post('/agents', utility.requireAuthentication, function(req, res) {
	var agent = {
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		email: req.body.email,
		is_admin: req.body.is_admin,
		active: req.body.active,
		password: 'processing'
	};

	//Generate salt, random password and hash async
	//This function processes async to give the user a fast response.
	//He should not wait for generating the salt, password, updating the db and sending the invitation/welcome email.
	utility.createAgent(agent, function(id) {
		bcrypt.genSalt(10, function(err, salt) {
			var gen_password = generatePassword(12, false);

			bcrypt.hash(gen_password, salt, function(err, hash) {

				utility.updateAgentPassword(id, hash, function(id) {
					utility.getAgent(id, function(agent) {
						//Send welcome email
						logger.info(agent);
						mailPackage.sendAgentWelcomeEmail(agent, gen_password);
					});
				});
			});
		});


		res.json( { 'success': true } );
	});
});

/* Updates agent */
router.post('/agents/:id', utility.requireAuthentication, function(req, res) {
	var agent = {
		id: req.params.id,
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		email: req.body.email,
		is_admin: req.body.is_admin,
		active: req.body.active,
		update_timestamp: moment().format()
	};

	utility.updateAgent(agent, function(id) {
		res.json( { 'success': true } );
	});
});

/* Loads customer details and returns json data */
router.get('/customer/:id', utility.requireAuthentication, function(req, res) {

	utility.getCustomer(req.params.id, function(customer) {

		utility.getUsersByCustomerId(req.params.id, function(users) {
			customer.users = users;

			utility.getDatamodel(req.params.id, function(datamodel) {
				utility.getDatatypes(function(datatypes) {
					utility.getBlacklist(function(blacklist) {
						res.render('administration-customer',
							{'name': customer.name, 'id': customer.id, 'users': customer.users, 'active': customer.active,
								'blacklist': blacklist, 'datamodel': datamodel, 'datatypes': datatypes });
					});
				})
			});
		});
	});
});

/* Renders "administration-add" view */
router.get('/customer', utility.requireAuthentication, function(req, res) {

	res.render('administration-add', {});
});

/* Creates a new customer */
router.post('/customer', utility.requireAuthentication, function(req, res) {

	var customer = {
		name: req.body.name,
		email_contact: req.body.email_contact,
		imap_email: req.body.imap_email,
		smtp_email: req.body.smtp_email,
		mailbox_user: req.body.mailbox_user,
		mailbox_password: req.body.mailbox_password,
		admin: { id: req.user.id }
	}

	utility.createCustomer(customer, function(id, err) {
		if(id != null) {
			res.json({ success: true, id: id });
		} else {
			logger.error(err);
			res.json({ success: false, error: { code: 1, msg: err } });
		}
	});
});

/* Disable customer */
router.delete('/customer/:id', utility.requireAuthentication, function(req, res) {
	utility.disableCustomer(req.params.id, function(id) {
		res.json({'success': true});
	});
});

/* Enable customer */
router.put('/customer/:id', utility.requireAuthentication, function(req, res) {
	utility.enableCustomer(req.params.id, function(id) {
		res.json({'success': true});
	});
});

/* Update customer */
router.post('/customer/:id', utility.requireAuthentication, function(req, res) {
	var customer = {
		'id': req.params.id,
		'name': req.body.name
	};

	utility.updateCustomer(customer, function(id) {
		res.json({'success': true});
	});
});

/* Add user */
router.post('/user', utility.requireAuthentication, function(req, res) {
	var user = {
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		email: req.body.email,
		active: req.body.active,
		password: 'processing',
		fk_customer_id: req.body.customer_id
	};

	//Insert into db
	utility.createUser(user, function(user_id) {
		//Generate salt, random password and hash async
		//This function processes async to give the user a fast response. He does not have to wait
		//for generating a salt, password and updating the db.
		bcrypt.genSalt(10, function(err, salt) {
			var gen_password = generatePassword(12, false);

			bcrypt.hash(gen_password, salt, function(err, hash) {
				//Update user object
				utility.updateUserPassword(user_id, hash, function(id) {
					utility.getUser(id, function(user) {
						//Send welcome email
						mailFunction.sendUserWelcomeEmail(user.first_name,
							user.last_name, user.email, gen_password);
					});
				});
			});
		});

		res.json( { 'success': true, 'user': user } );
	});
});

/* Edit user */
router.post('/user/:id', utility.requireAuthentication, function(req, res) {
	var user = {
		'id': req.params.id,
		'first_name': req.body.first_name,
		'last_name': req.body.last_name,
		'email': req.body.email
	};

	utility.updateUser(user, function(id) {
		res.json({'success': true});
	});
});

/* Delete user */
router.delete('/user/:id', utility.requireAuthentication, function(req, res) {
	utility.deleteUser(req.params.id, function(success) {
		res.json({'success': success});
	});
});

/* Create ticket field */
router.post('/ticketfield', utility.requireAuthentication, function(req, res) {
	knex('customer_datamodel').returning('id').insert({
		'name': req.body.name,
		'mandatory': req.body.mandatory,
		'fk_customer_id': req.body.customer_id,
		'fk_datatype_id': req.body.datatype_id,
		'active': req.body.active
	})
	.then(function(id) {
		id = id[0];

		utility.getDatamodel(req.body.customer_id, function(datamodel) {
			for(var i = 0; i < datamodel.length; i++) {
				if(datamodel[i].id == id) {
					res.json({'success': true, 'property': datamodel[i]});
				}
			}
		});

	})
	.catch(function(err) {
		logger.error(err);
		res.json({'success': false});
	});
});

/* Update ticket field */
router.put('/ticketfield/:id', utility.requireAuthentication, function(req, res) {
	if(req.body.name != "" && req.body.mandatory != undefined && req.body.customer_id != undefined &&
		req.body.customer_id > 0 && req.body.datatype_id != undefined && req.body.datatype_id > 0 &&
		req.body.active != undefined) {

		knex('customer_datamodel').returning('id').update({
			'name': req.body.name,
			'mandatory': req.body.mandatory,
			'fk_customer_id': parseInt(req.body.customer_id),
			'fk_datatype_id': parseInt(req.body.datatype_id),
			'active': req.body.active
		})
		.where({
			'id': req.params.id
		})
		.then(function(id) {
			id = id[0];
			res.json({'success': true});
		})
		.catch(function(err) {
			logger.error(err);
			res.json({'success': false});
		});
	} else {
		res.json({'success': false});
	}
});

module.exports = router;
