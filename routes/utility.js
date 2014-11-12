module.exports = {
	requireAuthentication: function (req, res, next){
		// check if the user is logged in
		if(!req.isAuthenticated()){
			req.session.messages = "You need to login to view this page";
			res.redirect('/');
		}
		next();
	},
	getUser: function (id) {
		
	},
	getDatamodel: function(customerid, callback) {
		//Select the customer datamodel and do join to datatype table to get the datatype
		knex('customer_datamodel')
			.select('customer_datamodel.id as id', 'customer_datatype.datatype as datatype',
				'customer_datamodel.name as name', 'customer_datamodel.mandatory as mandatory')
			.join('customer_datatype', 'customer_datamodel.fk_datatype_id', '=', 'customer_datatype.id')
			.where({
				'fk_customer_id': customerid
			})
			.then(function(rows) {
				var datamodel = [];
				
				for(var i = 0; i < rows.length; i++) {
					datamodel[i] = {
						'id': rows[i].id,
						'datatype': rows[i].datatype,
						'name': rows[i].name,
						'mandatory': rows[i].mandatory
					};
				}
				
				callback(datamodel);
			});
	},
	getTicketDatamodel: function(customerid, ticketid, callback) {
		
		//Select the specific values for one ticket.
		this.getDatamodel(customerid, function(datamodel) {
			knex('ticket_datamodel')
				.select('id', 'fk_datamodel_id', 'value')
				.where({
					'fk_ticket_id': ticketid
				})
				.then(function(rows) {
					
					for(var u = 0; u < datamodel.length; u++) {
						datamodel[u].value = null;
					}
					
					for(var i = 0; i < rows.length; i++) {
						
						for(var u = 0; u < datamodel.length; u++) {
							if(rows[i].fk_datamodel_id == datamodel[u].id) {
								datamodel[u].value = rows[i].value;
								break;
							}
						}
					}
					
					callback(datamodel);
					
				});
		});
	}
}
