var express = require('express');
var router = express.Router();
var utility = require('./utility');
var mailFunction = require('./mail');

router.get('/', utility.requireAuthentication, function(req, res) {
	utility.getCustomers(function(customers) {
		res.render('home', { title: 'Tickets', company: nconf.get('company').name,
				customers: customers
			});
	});
});

//Get a specific ticket
router.get('/:id', utility.requireAuthentication, function(req, res) {
		
		//Get ticket
		utility.getTicket(req.params.id, function(ticket) {
			
			utility.getAgents(function(agents) {
				res.render('ticket', { 
					'ticket': ticket,
					'agents': agents,
					'datamodel': ticket.datamodel
				});
			});
		});
});

/* GET tickets from a customer. */
router.get('/customer/:id', utility.requireAuthentication, function(req, res) {
			
		utility.getTicketsByCustomerId(req.params.id, function(tickets) {
			for(var i = 0; i < tickets.length; i++) {
				if(tickets[i].agent.id == null) {
					tickets[i].agent.id = false;
				}
				if(tickets[i].update_timestamp == null) {
					tickets[i].update_timestamp = false;
				}
			}
			
			utility.getAgents(function(agents) {
				utility.getDatamodel(req.params.id, function(datamodel) {
					utility.getUsersByCustomerId(req.params.id, function(users) {
						utility.getCustomers(function(customers) {
							res.render('tickets', { 
								title: 'Tickets', 
								company: nconf.get('company').name,
								tickets: tickets, 
								customers: customers, 
								agents: agents, 
								users: users,
								datamodel: datamodel
							});
						});
					});
				});
			});
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
	
	utility.createTicket(new_ticket, function(id) {
		res.json({ 'success': true, 'id': id });
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
