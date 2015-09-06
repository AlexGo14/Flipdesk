var objects = require("./objects");

var database = {
  getAgent: function (id, callback) {
		knex('agent')
			.select('id', 'first_name', 'last_name', 'create_timestamp', 'update_timestamp',
				'is_admin', 'email', 'active')
			.where({
				'id': id
			})
			.then(function(rows) {
				var agent = objects.setAgentObject(rows[0]);

				callback(agent);
			})
			.catch(function(err) {
				logger.error('Could not select customer from database with ID: ' + id + ' --- ' + err);

				callback(null);
			});
	},
  getUser: function (id, callback) {
		//Select user
		knex('user').select('id', 'first_name', 'last_name', 'email', 'fk_customer_id',
			'create_timestamp', 'update_timestamp', 'active')
			.where({
				'id': id
			})
			.then(function(rows) {

				if(rows.length == 1) {

					callback(
						objects.setUserObject(rows[0])
					);
				}
			}).catch(function(err) {

				logger.error('Could not get user from database --- ' + err);
			});
	},
  getCustomerByImapMailbox: function(imapmailbox, callback) {

		knex('customer')
			.select('id')
			.where({
				'email_mailbox_imap': imapmailbox
			})
			.then(function(rows) {

				database.getCustomer(rows[0].id, callback);
			})
			.catch(function(err) {
				logger.error('Could not select customer by imap mailbox from database --- ' + err);
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
					users[i] = objects.setUserObject(rows[i]);
				}

				callback(users);
			})
			.catch(function(err) {
				logger.error('Could not get users by customer id from database --- ' + err);
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

				callback(objects.setCustomerObject(rows[0]));
			})
			.catch(function(err) {
				logger.error('Could not select customer from database --- ' + err);
			});
	},
	createComment: function (comment, callback) {

		if(comment.user.id == null || comment.user.id == '') {
			comment.user.id = null;
		}

		if(comment.agent.id == null || comment.agent.id == '') {
			comment.agent.id = null;
		}

		//Don't know what I coded her, but it works
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
			})
			.catch(function(err) {
				logger.error('Could not get datamodel from database --- ' + err);
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

				callback(id, null);
			}
		})
		.catch(function(err) {
			logger.error('Could not create ticket in database --- ' + err);
			callback(null, err);
		});
	}
}

module.exports = database;
