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
	}
}

module.exports = database;
