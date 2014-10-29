var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
	knex.select().from('customer').then(function(rows) {
			res.render('administration', { title: 'Tickets', company: nconf.get('company').name,
				customers: rows
			});
	});
});

module.exports = router;
