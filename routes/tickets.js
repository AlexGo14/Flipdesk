var express = require('express');
var router = express.Router();
var Sequence = exports.Sequence || require('sequence').Sequence
    , sequence = Sequence.create()
    , err
    ;

router.get('/', function(req, res) {
	
	knex.select().from('customer').then(function(rows) {
			res.render('home', { title: 'Tickets', company: nconf.get('company').name,
				customers: rows
			});
	});
});

router.get('/:id', function(req, res) {
		
	sequence.then(
		function(next) {
			
			knex('ticket').where({
				id: req.params.id
			}).select().
			then(function(rows) {
				var ticket = {
						'id': rows[0].id,
						'content': rows[0].content,
						'caption': rows[0].caption,
						'comments': []
					};
				
				next(err, ticket);
			});
		}).
		then(
			function(next, err, ticket) {
				knex('agent').
					join('comment', 'agent.id', '=', 'comment.fk_agent_id').
					where({
						fk_ticket_id: req.params.id
					}).select('comment.id as comment_id', 'comment.content as comment_content', 'agent.id as agent_id', 'agent.last_name as agent_last_name', 'agent.first_name as agent_first_name').
				then(function(rows) {
					
					for(var i = 0; i < rows.length; i++) {
						ticket.comments[i] = { 'id': rows[i].comment_id, 
							'content': rows[i].comment_content,
							'agent': { 'id': rows[i].agent_id, 'name': rows[i].agent_last_name + ' ' + rows[i].agent_first_name } };
					}
					
					
					next(err, ticket)
				});
		}).
		then(function(next, err, ticket) {
			
			res.render('ticket', { 'caption': ticket.caption, 'id': ticket.id, 
				'content': ticket.content, 'comments': ticket.comments
			});
			
			next();
		});
});

/* GET tickets from a customer. */
router.get('/customer/:id', function(req, res) {
	
	var ticketsArr = [],
		agentsArr = [],
		usersArr = [],
		customersArr = [];
		
	sequence.
		then(function(next) {
			
			knex().select().from('ticket').
				then(function(rows) {
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
			console.log(usersArr);
			
			res.render('tickets', { title: 'Tickets', company: nconf.get('company').name,
				tickets: ticketsArr, customers: customersArr, agents: agentsArr, users: usersArr
			});
			
			next();
		});
});

/* Create Ticket */
router.post('/', function(req, res) {
	res.json({'response': true});
});

router.put('/:id', function(req, res) {
	
});

router.delete('/:id', function(req, res) {
	
});

module.exports = router;
