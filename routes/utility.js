
var utility = {
	requireAuthentication: function (req, res, next){
		// check if the user is logged in
		if(!req.isAuthenticated()){
			req.session.messages = "You need to login to view this page";
			res.redirect('/');
		}
		next();
	},

	getUser: function (id, callback) {
		//Select user
		knex('user').select('id', 'first_name', 'last_name', 'email', 'fk_customer_id',
			'create_timestamp', 'update_timestamp', 'active')
			.where({'id': id})
			.then(function(rows) {

				if(rows.length == 1) {

					callback(
						utility.setUserObject(rows[0])
					);
				}
			}).catch(function(err) {

				console.log(err);
			});
	},
	getUsers: function (callback) {
		knex('user').select('id', 'first_name', 'last_name', 'email', 'fk_customer_id',
			'create_timestamp', 'update_timestamp', 'active')
			.then(function(rows) {

				var users = [];

				for(var i = 0; i < rows.length; i++) {
					users[i] = utility.setUserObject(rows[i]);
				}

				callback(users);

			}).catch(function(err) {

			});
	},
	getUsersByCustomerId: function(customerid, callback) {
		knex('user')
			.select('id', 'first_name', 'last_name', 'email', 'fk_customer_id',
				'create_timestamp', 'update_timestamp', 'active')
			.where({
				'fk_customer_id': customerid
			})
			.orderBy('id', 'asc')
			.then(function(rows) {
				var users = [];

				for(var i = 0; i < rows.length; i++) {
					users[i] = utility.setUserObject(rows[i]);
				}

				callback(users);
			})
			.catch(function(err) {
				console.log(err);
			});
	},
	createUser: function (user, callback) {
		knex('user').returning('id').insert({
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email,
			active: user.active,
			password: user.password,
			fk_customer_id: user.customer_id,
			create_timestamp: moment().format()
		}).then(function(id) {
			callback(id[0]);
		}).catch(function(err) {
			console.log(err);
		});
	},
	updateUserPassword: function(id, hash, callback) {
		//Update agent object
		knex('user').returning('id').where({
			id: id
		}).update({
			password: hash
		}).then(function(id) {
			callback(id[0]);
		}).catch(function(err) {
			console.log(err);
		});
	},
	updateUser: function(user, callback) {
		knex('user').returning('id').update({
			'first_name': user.first_name,
			'last_name': user.last_name,
			'email': user.email
		}).where({
			id: user.id
		}).then(function(id) {
			callback(id[0]);
		}).catch(function(err) {
			console.log(err);
		});
	},

	getCustomer: function (id, callback) {
		knex('customer')
			.select('id', 'name', 'email_contact', 'create_timestamp',
				'update_timestamp', 'fk_created_by_admin', 'active')
			.where({
				'id': id
			})
			.then(function(rows) {

				callback(utility.setCustomerObject(rows[0]));
			})
			.catch(function(err) {

			});
	},
	getCustomersAdminSettings: function (callback) {

		knex('customer')
			.select('id', 'name', 'email_contact', 'create_timestamp',
				'update_timestamp', 'fk_created_by_admin', 'active',
				'email_mailbox', 'username_mailbox', 'password_mailbox', 'email_mailbox_imap',
				'email_mailbox_smtp')
			.then(function(rows) {
				var customers = [];

				for(var i = 0; i < rows.length; i++) {

					try {
						customers[i] = utility.setCustomerObjectAdminsSettings(rows[i]);
					} catch (err) {
						logger.error(err);
					}
				}

				callback(customers);
			})
			.catch(function(err) {
				logger.error("Could not fetch customer data: utility.getCustomersAdminSettings. ")
			});
	},
	getCustomers: function (callback) {
		knex('customer')
			.select('id', 'name', 'email_contact', 'create_timestamp',
				'update_timestamp', 'fk_created_by_admin', 'active')
			.then(function(rows) {
				var customers = [];

				for(var i = 0; i < rows.length; i++) {

					try {
						customers[i] = utility.setCustomerObject(rows[i]);
					} catch (err) {
						console.log(err);
					}
				}

				callback(customers);
			})
			.catch(function(err) {

			});
	},
	getCustomerByImapMailbox: function(imapmailbox, callback) {

		knex('customer')
			.select('id')
			.where({
				'email_mailbox_imap': imapmailbox
			})
			.then(function(rows) {

				utility.getCustomer(rows[0].id, callback);
			})
			.catch(function(err) {
				logger.error(err);
			});
	},
	disableCustomer: function (id, callback) {
		knex('customer').returning('id').update({
			active: false
		}).where({
			id: id
		}).then(function(id) {
			callback(id[0]);
		}).catch(function(err) {
			console.log(err);
		});
	},
	enableCustomer: function (id, callback) {
		knex('customer').returning('id').update({
			active: true
		}).where({
			id: id
		}).then(function(id) {
			callback(id[0]);
		}).catch(function(err) {
			console.log(err);
		});
	},
	updateCustomer: function (customer, callback) {
		knex('customer').returning('id').update({
			'name': customer.name
		}).where({
			'id': customer.id
		}).then(function(id) {
			callback(id[0]);
		}).catch(function(err) {
			console.log(err);
		});
	},
	createCustomer: function (customer, callback) {
		knex('customer').insert({
			'name': customer.name,
			'email_contact': customer.email_contact,
			'active': true,
			'fk_created_by_admin': customer.admin.id,
			'email_mailbox': customer.imap_email,
			'username_mailbox': customer.mailbox_user,
			'password_mailbox': customer.mailbox_password
		})
		.returning('id')
		.then(function(id) {
			callback(id[0], null);
		})
		.catch(function(err) {
			callback(null, err);
		});
	},

	getAgent: function (id, callback) {
		knex('agent')
			.select('id', 'first_name', 'last_name', 'create_timestamp', 'update_timestamp',
				'is_admin', 'email', 'active')
			.where({
				'id': id
			})
			.then(function(rows) {
				var agent = utility.setAgentObject(rows[0]);

				callback(agent);
			})
			.catch(function(err) {

				console.log('Cannot read agent with ID: ' + id + ' --- ' + err);
				callback(null);
			});
	},
	getAgents: function (callback) {
		knex('agent')
			.select('id', 'first_name', 'last_name', 'create_timestamp', 'update_timestamp',
				'is_admin', 'email', 'active')
			.then(function(rows) {

				var agents = [];

				for(var i = 0; i < rows.length; i++) {
					agents[i] = utility.setAgentObject(rows[i]);
				}

				callback(agents);
			})
			.catch(function(err) {
				console.log(err);
			});
	},
	createAgent: function (agent, callback) {
		knex('agent').returning('id').insert({
			first_name: agent.first_name,
			last_name: agent.last_name,
			email: agent.email,
			is_admin: agent.is_admin,
			active: agent.active,
			password: agent.password
		}).then(function(id) {
			callback(id[0]);
		}).catch(function(err) {
			console.log(err);
		});
	},
	updateAgentPassword: function (id, hash, callback) {
		//Update agent object
		knex('agent').returning('id').where({
			id: id
		}).update({
			password: hash
		}).then(function(id) {
			callback(id[0]);
		}).catch(function(err) {
			console.log(err);
		});
	},
	updateAgent: function(agent, callback) {
		knex('agent').returning('id').update({
			first_name: agent.first_name,
			last_name: agent.last_name,
			email: agent.email,
			is_admin: agent.is_admin,
			active: agent.active,
			update_timestamp: moment().format()
		}).where({
			id: agent.id
		}).then(function(id) {
			callback(id[0]);
		}).catch(function(err) {
			console.log(err);
		});
	},

	getTicket: function (id, callback) {

		knex('ticket')
			.select('id', 'description', 'caption', 'create_timestamp', 'update_timestamp',
				'fk_agent_id', 'fk_user_id', 'solved')
			.where({
				'id': id
			})
			.then(function(rows) {
				if(rows.length == 1) {

					var ticket = utility.setTicketObject(rows[0]);

					utility.getCommentsByTicketId(ticket.id, function(comments) {
						ticket.comments = comments;


						utility.getUser(ticket.user.id, function(user) {
							ticket.user = user;

							utility.getAgent(ticket.agent.id, function(agent) {
								ticket.agent = agent;

								utility.getTicketDatamodel(ticket.user.customer.id, id, function(datamodel) {
									ticket.datamodel = datamodel;

									callback(ticket);
								});
							});
						});
					});
				} else {

				}
			}).catch(function(err) {
				console.log(err);
			});
	},
	getTicketsByCustomerId: function (customerid, callback) {
		knex('ticket')
			.select('ticket.id', 'ticket.description', 'ticket.caption', 'ticket.create_timestamp', 'ticket.update_timestamp',
				'ticket.fk_agent_id', 'ticket.fk_user_id', 'ticket.solved')
			.join('user', 'ticket.fk_user_id', '=', 'user.id')
			.where({
				'user.fk_customer_id': customerid
			})
			.orderBy('ticket.update_timestamp', 'desc')
			.then(function(rows) {

				var tickets = [];

				for(var i = 0; i < rows.length; i++) {
					tickets[i] = utility.setTicketObject(rows[i]);
				}

				callback(tickets);

			}).catch(function(err) {
				console.log(err);
			});
	},
	createTicket: function (ticket, callback) {


		knex('ticket').returning('id').insert([{
			'caption': ticket.caption,
			'description': ticket.description,
			'fk_user_id': ticket.user.id,
			'fk_agent_id': ticket.agent.id
		}]).then(function(id) {
			id = id[0];

			for(var i = 0; i < ticket.properties.length; i++) {
				knex('ticket_datamodel')
					.insert({
						'fk_ticket_id': id,
						'fk_datamodel_id': ticket.properties[i].datamodel_id,
						'value': ticket.properties[i].value
					})
					.then(function(data) {

					})
					.catch(function(err) {
						logger.error(err);
					});
			}

			if(id > 0) {
				if(ticket.agent.id != -1) {
					mailFunction.sendNewTicket();
				}

				callback(id, null);
			}
		})
		.catch(function(err) {
			callback(null, err);c
		});
	},
	assignAgent: function (agent_id, ticket_id, callback, error) {
		knex('ticket')
			.returning('id')
			.update({
				fk_agent_id: agent_id,
				update_timestamp: moment().format()
			})
			.where({
				'id': ticket_id
			})
			.then(function(id) {
				callback(id[0]);
			})
			.catch(function(err) {
				error(err);
				console.log(err);
			});
	},

	createComment: function (comment, callback) {

		if(comment.user.id == null || comment.user.id == '') {
			comment.user.id = null;
		} else {
			console.log('user ' + null + comment.user.id);
		}

		if(comment.agent.id == null || comment.agent.id == '') {
			comment.agent.id = null;
		} else {
			console.log('agent ' + comment.agent.id);
		}

		//Don't know what I coded her, but it bloody works
		knex.select('id').from('comment').where({
			'fk_ticket_id': comment.ticket.id
			}).orderBy('fk_previous_comment_id', 'asc').limit(1).then(function(rows) {

				if(rows.length > 0) {

					knex('comment').returning('id').insert([{
						'description': comment.description,
						'fk_agent_id': comment.agent.id,
						'fk_ticket_id': comment.ticket.id,
						'fk_user_id': comment.user.id,
						'fk_previous_comment_id': rows[0].id
					}]).then(function(id) {
						callback(id, null);
					}).catch(function(err) {
						callback(null, err);
					});

				} else {

					//There are no previous comments, so we will create the initial one

					knex('comment').returning('id').insert([{
						'description': comment.description,
						'fk_agent_id': comment.agent.id,
						'fk_user_id': comment.user.id,
						'fk_ticket_id': comment.ticket.id
					}]).then(function(id) {

						callback(id, null);
					}).catch(function(err) {
						callback(null, err);
					});
				}
		});
	},
	getCommentsByTicketId: function (ticketid, callback) {
		knex('comment')
			.select('id', 'description', 'fk_user_id', 'fk_agent_id',
				'fk_ticket_id', 'fk_previous_comment_id', 'create_timestamp')
			.where({
				'fk_ticket_id': ticketid
			})
			.orderBy('fk_previous_comment_id', 'desc')
			.then(function(rows) {
				var comments = [];

				for(var i = 0; i < rows.length; i++) {
					comments[i] = utility.setCommentObject(rows[i]);
				}

				callback(comments);
			})
			.catch(function(err) {
				console.log(err);
			});
	},

	getDatatypes: function(callback) {
		knex('customer_datatype')
			.select('id', 'datatype')
			.orderBy('id', 'desc')
			.then(function(rows) {
				var datatypes = [];

				for(var i = 0; i < rows.length; i++) {
					datatypes[i] = {
						'id': rows[i].id,
						'datatype': rows[i].datatype
					};
				}

				callback(datatypes);
			})
			.catch(function(err) {
				console.log(err);
			});
	},
	getDatamodel: function(customerid, callback) {
		//Select the customer datamodel and do join to datatype table to get the datatype
		knex('customer_datamodel')
			.select('customer_datamodel.id as id', 'customer_datatype.datatype as datatype',
				'customer_datamodel.name as name', 'customer_datamodel.mandatory as mandatory',
				'customer_datamodel.active as active')
			.join('customer_datatype', 'customer_datamodel.fk_datatype_id', '=', 'customer_datatype.id')
			.where({
				'fk_customer_id': customerid
			})
			.orderBy('id', 'asc')
			.then(function(rows) {
				var datamodel = [];

				for(var i = 0; i < rows.length; i++) {
					datamodel[i] = {
						'id': rows[i].id,
						'datatype': rows[i].datatype,
						'name': rows[i].name,
						'mandatory': rows[i].mandatory,
						'active': rows[i].active
					};
				}

				callback(datamodel);
			});
	},
	getTicketDatamodel: function(customerid, ticketid, callback) {

		//Select the specific values for one ticket.
		utility.getDatamodel(customerid, function(datamodel_temp) {
			knex('ticket_datamodel')
				.select('id', 'fk_datamodel_id', 'value')
				.where({
					'fk_ticket_id': ticketid
				})
				.then(function(rows) {

					//Eliminate inactive properties
					var datamodel = []
					for(var i = 0; i < datamodel_temp.length; i++) {
						if(datamodel_temp[i].active) {
							datamodel[i] = datamodel_temp[i];
						}
					}

					//Set unsetted properties on null
					for(var u = 0; u < datamodel.length; u++) {
						datamodel[u].value = null;
					}

					//Connect the values with the datamodel
					for(var i = 0; i < rows.length; i++) {

						for(var u = 0; u < datamodel.length; u++) {
							if(rows[i].fk_datamodel_id == datamodel[u].id) {
								datamodel[u].value = rows[i].value;
								break;
							}
						}
					}

					callback(datamodel);

				});
		});
	},

	getBlacklist: function(callback) {
		knex('blacklist')
			.select('id', 'email')
			.then(function(rows) {
				callback(rows);
			})
			.catch(function(err) {
				console.log(err);
			});
	},

	sendEmail: function(customer_id, description, subject, to) {
		utility.getCustomer(customer_id, function (customer) {
			var message = {
				'text': { 'raw': description },
				'subject': subject,
				'to': to,
				'from': customer.email_mailbox,
				'attachments': []
			};

			var server = {
				'user': customer.username_mailbox,
				'password': customer.password_mailbox,
				'host': customer.email_mailbox_stmp
			}

			email.send(server, email);
		});
	},

	setUserObject: function(input) {
		return {
			'id': input.id,
			'first_name': input.first_name,
			'last_name': input.last_name,
			'email': input.email,
			'customer': {'id': input.fk_customer_id},
			'create_timestamp': input.create_timestamp,
			'update_timestamp': input.update_timestamp,
			'active': input.active
		};
	},
	setCustomerObjectAdminsSettings: function(input) {
		var customer = {
			'id': input.id,
			'name': input.name,
			'email': input.email_contact,
			'create_timestamp': input.create_timestamp,
			'update_timestamp': input.update_timestamp,
			'admin': { 'id': input.fk_created_by_admin },
			'active': input.active,
			'email_mailbox': input.email_mailbox,
			'username_mailbox': input.username_mailbox,
			'password_mailbox': input.password_mailbox,
			'email_mailbox_imap': input.email_mailbox_imap,
			'email_mailbox_smtp': input.email_mailbox_smtp
		};

		return customer;
	},
	setCustomerObject: function(input) {

		var customer = {
			'id': input.id,
			'name': input.name,
			'email': input.email_contact,
			'create_timestamp': input.create_timestamp,
			'update_timestamp': input.update_timestamp,
			'admin': { 'id': input.fk_created_by_admin },
			'active': input.active
		};

		return customer;
	},
	setTicketObject: function(input) {
		var ticket = {
			'id': input.id,
			'description': input.description,
			'caption': input.caption,
			'comments': [],
			'create_timestamp': {
					'short': moment(input.create_timestamp).tz('Pacific/Auckland').startOf('minute').fromNow(),
					'detailed': moment(input.create_timestamp).tz('Pacific/Auckland').format('Do MMMM YYYY, h:mm a')
			 },
			 'update_timestamp': null,
			'agent': {'id': input.fk_agent_id },
			'user': { 'id': input.fk_user_id }
		};

		if(input.update_timestamp != null) {
			ticket.update_timestamp = {
					'short': moment(input.update_timestamp).tz('Pacific/Auckland').startOf('minute').fromNow(),
					'detailed': moment(input.update_timestamp).tz('Pacific/Auckland').format('Do MMMM YYYY, h:mm a')
			};
		}

		return ticket;
	},
	setCommentObject: function(input) {
		return {
			'id': input.id,
			'description': input.description,
			'user': {'id': input.fk_user_id},
			'agent': {'id': input.fk_agent_id},
			'ticket': {'id': input.fk_ticket_id},
			'previous_comment': {'id': input.fk_previous_comment_id},
			'create_timestamp': {
					'short': moment(input.create_timestamp).tz('Pacific/Auckland').startOf('minute').fromNow(),
					'detailed': moment(input.create_timestamp).tz('Pacific/Auckland').format('Do MMMM YYYY, h:mm a')
			 }
		};
	},
	setAgentObject: function(input) {
		return {
			'id': input.id,
			'first_name': input.first_name,
			'last_name': input.last_name,
			'create_timestamp': {
				'short': moment(input.create_timestamp).tz('Pacific/Auckland').startOf('minute').fromNow(),
				'detailed': moment(input.create_timestamp).tz('Pacific/Auckland').format('Do MMMM YYYY, h:mm a')
			},
			'update_timestamp': {
				'short': moment(input.create_timestamp).tz('Pacific/Auckland').startOf('minute').fromNow(),
				'detailed': moment(input.create_timestamp).tz('Pacific/Auckland').format('Do MMMM YYYY, h:mm a')
			},
			'is_admin': input.is_admin,
			'email': input.email,
			'active': input.active
		};
	},
	checkDatabaseConnection: function() {
		return knex('customer').select().then(function(rows) {
				logger.info('Database connection successfully established.');

				return true;
			}).catch(function(rows) {
				logger.error('Could not connect to database. Check credentials.');

				return false;
			});
	}
}

module.exports = utility;
