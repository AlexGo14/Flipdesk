var express = require('express');
var router = express.Router();
var utility = require('./utility');
var moment = require('moment-timezone');
var Sequence = exports.Sequence || require('sequence').Sequence
    , sequence = Sequence.create()
    , err;
var mailFunction = require('./mail');

router.get('/', utility.requireAuthentication, function(req, res) {
	
	knex.select().from('customer').then(function(rows) {
			res.render('home', { title: 'Tickets', company: nconf.get('company').name,
				customers: rows
			});
	});
});

//Get a specific ticket
router.get('/:id', utility.requireAuthentication, function(req, res) {
		
	sequence.then(
		function(next) {
			//Get ticket
			knex('ticket').where({
				id: req.params.id
			}).select().
			then(function(rows) {
				var ticket = {
						'id': rows[0].id,
						'description': rows[0].description,
						'caption': rows[0].caption,
						'comments': [],
						'create_timestamp': {
								'short': moment(rows[0].create_timestamp).tz('Pacific/Auckland').startOf('minute').fromNow(),
								'detailed': moment(rows[0].create_timestamp).tz('Pacific/Auckland').format('Do MMMM YYYY, h:mm a')
						 },
						 //Saves agent id to load the agent afterwards.
						'agent': rows[0].fk_agent_id,
						//Saves user id to load the user aftwards.
						'user': rows[0].fk_user_id
					};
					
				if(ticket.agent == null) {
					ticket.agent = false;
				}
				if(ticket.user == null) {
					ticket.user = false;
				}
					
				next(err, ticket);
			});
		}).
		then(function(next, err, ticket) {
			//Gets every comment and agent of the comment
				knex('agent').
					join('comment', 'agent.id', '=', 'comment.fk_agent_id').
					where({
						fk_ticket_id: req.params.id
					}).select('comment.id as comment_id', 'comment.create_timestamp as comment_create_timestamp', 'comment.description as comment_description', 'agent.id as agent_id', 'agent.last_name as agent_last_name', 'agent.first_name as agent_first_name', 'agent.email as agent_email').
				then(function(rows) {
					
					for(var i = 0; i < rows.length; i++) {
						ticket.comments[i] = { 'id': rows[i].comment_id, 
							'description': rows[i].comment_description,
							'agent': { 'id': rows[i].agent_id, 'name': rows[i].agent_first_name + ' ' + rows[i].agent_last_name, 
								'email': rows[i].agent_email },
							'create_timestamp': {
								'short': moment(rows[i].comment_create_timestamp).tz('Pacific/Auckland').startOf('minute').fromNow(),
								'detailed': moment(rows[i].comment_create_timestamp).tz('Pacific/Auckland').format('Do MMMM YYYY, h:mm a')
								 }
							}
					}
					
					ticket.comments.reverse();
					
					next(err, ticket)
				});
		}).
		then(function(next, err, ticket) {
			//Gets every agent
			knex('agent').select().then(function(rows) {
				var agents = [];
				for(var i = 0; i < rows.length; i++) {
					
					agents[i] = {
						'id': rows[i].id,
						'first_name': rows[i].first_name,
						'last_name': rows[i].last_name,
						'email': rows[i].email
					};
					
					//If the agent id is equal to the stored agent id, the object is set.
					if(ticket.agent == agents[i].id) {
						ticket.agent = agents[i];
					}
				}
				
				next(err, ticket, agents);
			});
		}).
		then(function(next, err, ticket, agents) {
			//Gets user
			if(ticket.user) {
				knex('user').select('id', 'first_name', 'last_name', 'email', 'fk_customer_id', 'create_timestamp', 'update_timestamp', 'active')
					.where({'id': ticket.user})
					.then(function(rows) {
						
						if(rows.length == 1) {
							ticket.user = {
								'id': rows[0].id,
								'first_name': rows[0].first_name,
								'last_name': rows[0].last_name,
								'email': rows[0].email,
								'customer': {'id': rows[0].fk_customer_id}
							};
						}
					
						next(err, ticket, agents);
				});
			} else {
				next(err, ticket, agents);
			}
		}).
		then(function(next, err, ticket, agents) {
			//Gets companies datamodel
			utility.getTicketDatamodel(ticket.user.customer.id, ticket.id, function(datamodel) {
				next(err, ticket, agents, datamodel);
			});
			
			
			
		}).
		then(function(next, err, ticket, agents, datamodel) {
			
			res.render('ticket', { 
				'ticket': ticket,
				'agents': agents,
				'datamodel': datamodel
			});
			
			next();
		});
});

/* GET tickets from a customer. */
router.get('/customer/:id', utility.requireAuthentication, function(req, res) {
	
	var ticketsArr = [],
		agentsArr = [],
		usersArr = [],
		customersArr = [];
		
	sequence.
		then(function(next) {
			
			knex().select().from('ticket').orderBy('update_timestamp', 'desc')
				.then(function(rows) {
					for(var i = 0; i < rows.length; i++) {
						if(rows[i].fk_agent_id == null) {
							rows[i].fk_agent_id = false;
						}
						if(rows[i].update_timestamp == null) {
							rows[i].update_timestamp = false;
						}
					}
					ticketsArr = rows;
					
					next(err);
				});
		}).
		then(function(next) {
			
			knex().select().from('agent').
				then(function(rows) {
					agentsArr = rows;
					
					next(err);
				});
		}).
		then(function(next) {
			
			knex('user').where({
				fk_customer_id: req.params.id
			}).select().then(function(rows) {
				usersArr = rows
				
				next(err);
			});
		}).
		then(function(next) {
			knex().select().from('customer').
				then(function(rows) {
					customersArr = rows;
					
					next(err);
				});
		}).
		then(function(next) {
			
			res.render('tickets', { title: 'Tickets', company: nconf.get('company').name,
				tickets: ticketsArr, customers: customersArr, agents: agentsArr, users: usersArr
			});
			
			next();
		});
});

/* Create Ticket */
router.post('/', utility.requireAuthentication, function(req, res) {
	
	var new_ticket = {
		'id': -1,
		'caption': req.body.caption,
		'description': req.body.description,
		'user': {
			'id': parseInt(req.body.user_id)
		},
		'agent': {
			'id': parseInt(req.body.agent_id)
		}
	}
	
	
	knex('ticket').returning('id').insert([{
		'caption': new_ticket.caption,
		'description': new_ticket.description,
		'fk_user_id': new_ticket.user.id,
		'fk_agent_id': new_ticket.agent.id
	}]).then(function(id) {
		if(id > 0) {
			mailFunction.sendNewTicket();
			
			res.json({ 'success': true, 'id': id });
		}
	});
});

/* Update a ticket */
router.put('/:id', utility.requireAuthentication, function(req, res) {
	
});

/* Archive a ticket */
router.delete('/:id', utility.requireAuthentication, function(req, res) {
	
});

/* Assign agent to ticket */
router.post('/:id/assign/:agent_id', utility.requireAuthentication, function(req, res) {
	var ticket_id = req.params.id;
	agent_id = req.params.agent_id;
	
	if(agent_id > 0) {
		knex('ticket')
			.returning('id')
			.update({
				fk_agent_id: agent_id,
				update_timestamp: moment().format()
			})
			.where('id', '=', ticket_id)		
			.then(function(id) {
				res.json( { success: true } );
			})
			.catch(function(err) {
				console.log(err);
				res.json( { success: false } );
		});
	} else if(agent_id == -1) {
		knex('ticket')
			.returning('id')
			.update({
				fk_agent_id: null,
				update_timestamp: moment().format()
			})
			.where('id', '=', ticket_id)
			.then(function(id) {
				res.json( { success: true } );
			})
			.catch(function(err) {
				console.log(err);
				res.json( { success: false } );
		});
	}
});

//Create a comment
router.post('/:id/comment', utility.requireAuthentication, function(req, res) {
	var new_comment = {
		'description': req.body.description,
		'ticket': {
			'id': req.body.ticket_id
		},
		'agent': {
			'id': req.body.agent_id
		},
		'user': {
			'id': req.body.user_id
		}
	};
	
	if(new_comment.agent.id != null) {
		new_comment.agent.id = parseInt(new_comment.agent.id);
	} else if(new_comment.user.id != null) {
		new_comment.user.id = parseInt(new_comment.user.id);
	} else {
		
	}
	
	knex.select('id').from('comment').where({
		'fk_ticket_id': new_comment.ticket.id
		}).orderBy('fk_previous_comment_id', 'asc').limit(1).then(function(rows) {
			if(rows.length > 0) {
				if(new_comment.agent.id != null) {
					knex('comment').returning('id').insert([{
					'description': new_comment.description,
					'fk_agent_id': new_comment.agent.id,
					'fk_ticket_id': new_comment.ticket.id,
					'fk_previous_comment_id': rows[0].id
					}]).then(function(id) {
						if(id > 0) {
							res.json({ 'success': true, 'id': id });
						}
					});
				} else if(new_comment.user.id != null) {
					new_comment.user.id = parseInt(new_comment.user.id);
				} else {
					
				}
				
				
			} else {
				knex('comment').returning('id').insert([{
					'description': new_comment.description,
					'fk_agent_id': new_comment.agent.id,
					'fk_ticket_id': new_comment.ticket.id
					}]).then(function(id) {
						if(id > 0) {
							mailFunction.sendComment();
							
							res.json({ 'success': true, 'id': id });
						}
					});
			}
	});
});

module.exports = router;
