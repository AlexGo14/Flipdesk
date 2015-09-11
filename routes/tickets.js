/*
Flipdesk. A flexible helpdesk system.
Copyright (C) 2015  Johannes Giere, jogiere AT gmail com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
var express = require('express');
var router = express.Router();
var utility = require('../packages/utility');
var nconf = utility.configureNconf();
var emailPackage = require('../packages/mail');
var database = require('../packages/database');

router.get('/', utility.requireAuthentication, function(req, res) {

	database.getAssignmentsByUser(req.user.id, function(ticket_assignments) {

		ticket_assignments.sort(function(a, b) {
			return new Date(a.create_timestamp.system) - new Date(b.create_timestamp.system)
		});

		database.getCustomers(function(customers) {

			res.render('home', { title: 'Tickets', company: nconf.get('company').name,
					company_info: nconf.get('company').info_description, customers: customers,
					assignments: ticket_assignments
			});
		});
	});
});

//Get a specific ticket
router.get('/:id', utility.requireAuthentication, function(req, res) {

		//Get ticket
		database.getTicket(req.params.id, function(ticket) {

			//Check for a recursive comment list view
			if(nconf.get('view').recursiveCommentList) {
				ticket.comments.reverse();
			}

			database.getActiveAgents(function(agents) {
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

		database.getTicketsByCustomerId(req.params.id, function(data) {

			var tickets = {
				'current': [],
				'solved': []
			}

			//Process tickets.
			for(var i = 0; i < data.length; i++) {
				if(data[i].agent.id == null) {
					data[i].agent.id = false;
				}
				if(data[i].update_timestamp == null) {
					data[i].update_timestamp = false;
				}

				//Split tickets by solved status.
				if(data[i].solved) {
					tickets.solved.push(data[i]);
				} else {
					tickets.current.push(data[i]);
				}
			}

			database.getActiveAgents(function(agents) {
				database.getDatamodel(req.params.id, function(datamodel_draft) {

					var datamodel = [];
					for(var i = 0; i < datamodel_draft.length; i++) {
						if(datamodel_draft[i].active == true) {
							datamodel.push(datamodel_draft[i]);
						}
					}

					database.getUsersByCustomerId(req.params.id, function(users) {
						database.getCustomers(function(customers) {
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
		},
		'properties': req.body.properties
	}

	database.getUser(new_ticket.user.id, function(user) {
		database.getDatamodel(user.customer.id, function(datamodel) {

			for(var i = 0; i < datamodel.length; i++) {
				if(datamodel[i].mandatory) {
					for(var u = 0; u < new_ticket.properties.length; u++) {
						if(new_ticket.properties[u].datamodel_id == datamodel[i].id &&
							datamodel[i].mandatory && new_ticket.properties[u].value == '') {
							res.json({'success': false, 'error': { message: 'Mandatory property not set (property id: ' + datamode[i].id + ')',
								'code': 1 } });

							return;
						}
					}
				}
			}

			database.createTicket(new_ticket, function(id, err) {
				if(!err) {
					new_ticket.id = id;

					database.getTicket(new_ticket.id, function(ticketObj) {
						res.json({ 'success': true, 'ticket': ticketObj });
					});

					//Send a notification ticket to the agent.
					emailPackage.notificationNewTicket(new_ticket);
				} else {
					res.json({'success': false, 'error': 'Internal server error'});
				}
			});
		});
	});

});

/* Update a ticket */
router.put('/:id', utility.requireAuthentication, function(req, res) {

	if(req.body.solved) {
		database.getTicket(req.params.id, function(ticket) {

			if(ticket.agent.id != null) {
				database.solveTicket(req.params.id,
					function(solved) {
						if(solved) {
							res.json( { 'success': true } );
						} else {
							res.json( { 'success': false } );
						}
					},
					function(err) {

					});
			} else {
				res.json( { 'success': false } );
			}
		});
	}
});

/* Archive a ticket */
router.delete('/:id', utility.requireAuthentication, function(req, res) {
	database.archiveTicket(req.params.id, function(archived) {
			if(archived) {
				res.json( { 'success': true } );
			} else {
				res.json( { 'success': false } );
			}
		},
		function(err) {

		});
});

/* Assign agent to ticket */
router.post('/:id/assign/:agent_id', utility.requireAuthentication, function(req, res) {
	var ticket_id = req.params.id;
	var agent_id = req.params.agent_id;

	if(agent_id == -1) {
		agent_id = null;
	}

	database.assignAgent(agent_id, ticket_id,
		function(id) {
			res.json( { success: true } );
		},
		function(err) {
			if(err.code == 3) {
				res.json( { success: false, error: { 'code': err.code } } );
			} else {
				res.json( { success: false, error: { 'code': 0} } );
			}
		});
});

//Create a comment
router.post('/:id/comment', utility.requireAuthentication, function(req, res) {
	var new_comment = {
		'description': req.body.description,
		'ticket': {
			'id': parseInt(req.body.ticket_id)
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
	}

	database.createComment(new_comment, function(id, error) {
		if(!error) {
			if(new_comment.agent.id != null) {
				new_comment.comment = { 'id': id };

				database.getTicket(new_comment.ticket.id, function(ticket) {
					new_comment.ticket = ticket;

					emailPackage.notificationNewComment(new_comment);
				});
			}

			res.json({ 'success': true, 'id': id });
		} else {
			logger.error(error);
		}
	});
});

module.exports = router;
