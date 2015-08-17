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
	}
}

module.exports = database;
