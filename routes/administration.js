var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
	pg.connect(conString, function(err, client, done) {
		if(err) {
			return console.error('error fetching client from pool', err);
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
				
				res.render('administration', { title: 'Administration', company: nconf.get('company').name,
					customers: customerArr
				});
			});
	});
});

module.exports = router;
