var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
		
	knex.select().from('customer').
		then(function(rows) {
			res.render('home', { title: 'Tickets', company: nconf.get('company').name,
				customers: rows
			});
	});
	
});

router.get('/:id', function(req, res) {
	pg.connect(conString, function(err, client, done) {
		if(err) {
			return console.error('error fetching client from pool', err);
		}
		client.query('SELECT * FROM "' + nconf.get('database').name + '".ticket WHERE id = ' + req.params.id, function(err, result) {
			
			done();

			if(err) {
				return console.error('error running query', err);
			}
			
			var ticket = {};
			if(result.rows.length == 1) {
				ticket = {
					'caption': result.rows[0].caption,
					'id': result.rows[0].id,
					'content': result.rows[0].content,
					'comments': []
				};
			}
			
			
			client.query('SELECT c.id AS comment_id, c.content, a.id AS agent_id, a.last_name, a.first_name FROM "' + nconf.get('database').name + '".comment AS c, "' + nconf.get('database').name + '".agent AS a WHERE c.fk_ticket_id = ' + req.params.id + ' AND c.fk_agent_id = a.id', function(err, result) {
			
				done();

				if(err) {
					return console.error('error running query', err);
				}
				
				console.log(result.rows);
				
				for(var i = 0; i < result.rows.length; i++) {
					ticket.comments[i] = { 'id': result.rows[i].comment_id, 
						'content': result.rows[i].content,
						'agent': { 'id': result.rows[i].agent_id, 'name': result.rows[i].last_name + ' ' + result.rows[i].first_name } };
				}
				
				client.end();
				
				res.render('ticket', { 'caption': ticket.caption, 'id': ticket.id, 
					'content': ticket.content, 'comments': ticket.comments
				});
			});			
		});
	});
});

/* GET tickets from a customer. */
router.get('/customer/:id', function(req, res) {
	var ticketsArr = [];
	
	pg.connect(conString, function(err, client, done) {
		if(err) {
			return console.error('error fetching client from pool', err);
		}
		client.query('SELECT * FROM "' + nconf.get('database').name + '".ticket', function(err, result) {
			
			//call `done()` to release the client back to the pool
			done();

			if(err) {
				return console.error('error running query', err);
			}
			
			for( var i = 0; i < result.rows.length; i++) {
				ticketsArr[i] = { "id": result.rows[i].id, "caption": result.rows[i].caption, "content": result.rows[i].content };
			}
			
			client.query('SELECT * FROM "' + nconf.get('database').name + '".agent', function(err, result) {
				done();
				
				if(err) {
					return console.error('error running query', err);
				}
				
				var agentsArr = [];
				for(var i = 0; i < result.rows.length; i++) {
					agentsArr[i] = { 'id': result.rows[i].id, 'first_name': result.rows[i].first_name, 'last_name': result.rows[i].last_name };
				}
				
				client.query('SELECT * FROM "' + nconf.get('database').name + '".user WHERE fk_customer_id = ' + req.params.id, function(err, result) {
					done();
				
					if(err) {
						return console.error('error running query', err);
					}
					
					var userArr = [];
					for(var i = 0; i < result.rows.length; i++) {
						userArr[i] = { 'id': result.rows[i].id, 'first_name': result.rows[i].first_name, 'last_name': result.rows[i].last_name, 'email': result.rows[i].email };
					}
					
					client.query('SELECT * FROM "' + nconf.get('database').name + '".customer', function(err, result) {
						done();
						
						if(err) {
							return console.error('error running query', err);
						}
						var customerArr = []
						for(var i = 0; i < result.rows.length; i++) {
							customerArr[i] = { "id": result.rows[i].id, "name": result.rows[i].name };
						}
						
						client.end();
						console.log(userArr);
						res.render('tickets', { title: 'Tickets', company: nconf.get('company').name,
							tickets: ticketsArr, customers: customerArr, agents: agentsArr, users: userArr
						});
					});
				});
			});
		});
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
