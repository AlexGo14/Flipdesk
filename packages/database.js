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
var objects = require("./objects");
var utility = require('./utility');
var nconf = utility.configureNconf();
//Configure database
knex = require('knex')({
	client: nconf.get('database').type,
	connection: {
		host: nconf.get('database').ip,
		user: nconf.get('database').user,
		password: nconf.get('database').password,
		database: nconf.get('database').name
	},
	pool: {
		min: 0,
		max: 10
	}//,
	//debug: true
});

var database = {

	checkDatabaseConnection: function(callback) {
		return knex('customer').select().then(function(rows) {
				logger.info('Database connection successfully established.');

				callback(true);
			}).catch(function(ex) {
				logger.error('Could not connect to database. Check credentials.');

				callback(false);
			});
	},
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
	},
  getCustomerByImapMailbox: function(imapmailbox, callback) {

		knex('customer')
			.select('id')
			.where({
				'email_mailbox_imap': imapmailbox
			})
			.then(function(rows) {

				database.getCustomer(rows[0].id, callback);
			})
			.catch(function(err) {
				logger.error('Could not select customer by imap mailbox from database --- ' + err);
			});
	},
	getUsersByCustomerId: function(customerid, callback) {

		knex('user')
			.select('id', 'first_name', 'last_name', 'email', 'fk_customer_id',
				'create_timestamp', 'update_timestamp', 'active')
			.where({
				'fk_customer_id': customerid
			})
			.orderBy('id', 'asc')
			.then(function(rows) {
				var users = [];

				for(var i = 0; i < rows.length; i++) {
					users[i] = objects.setUserObject(rows[i]);
				}

				callback(users);
			})
			.catch(function(err) {
				logger.error('Could not get users by customer id from database --- ' + err);
			});
	},
	getCustomer: function (id, callback) {
		knex('customer')
			.select('id', 'name', 'email_contact', 'create_timestamp',
				'update_timestamp', 'fk_created_by_admin', 'active')
			.where({
				'id': id
			})
			.then(function(rows) {

				callback(objects.setCustomerObject(rows[0]));
			})
			.catch(function(err) {
				logger.error('Could not select customer from database --- ' + err);
			});
	},
	createComment: function (comment, callback) {

		if(comment.user.id == null || comment.user.id == '') {
			comment.user.id = null;
		}

		if(comment.agent.id == null || comment.agent.id == '') {
			comment.agent.id = null;
		}

		//Don't know what I coded her, but it works
		knex.select('id').from('comment').where({
			'fk_ticket_id': comment.ticket.id
			}).orderBy('fk_previous_comment_id', 'asc').limit(1).then(function(rows) {

				if(rows.length > 0) {

					knex('comment').returning('id').insert([{
						'description': comment.description,
						'fk_agent_id': comment.agent.id,
						'fk_ticket_id': comment.ticket.id,
						'fk_user_id': comment.user.id,
						'fk_previous_comment_id': rows[0].id
					}]).then(function(id) {
						callback(id, null);
					}).catch(function(err) {
						callback(null, err);
					});

				} else {

					//There are no previous comments, so we will create the initial one

					knex('comment').returning('id').insert([{
						'description': comment.description,
						'fk_agent_id': comment.agent.id,
						'fk_user_id': comment.user.id,
						'fk_ticket_id': comment.ticket.id
					}]).then(function(id) {

						callback(id, null);
					}).catch(function(err) {
						callback(null, err);
					});
				}
		});
	},
	getDatamodel: function(customerid, callback) {
		//Select the customer datamodel and do join to datatype table to get the datatype
		knex('customer_datamodel')
			.select('customer_datamodel.id as id', 'customer_datatype.datatype as datatype',
				'customer_datamodel.name as name', 'customer_datamodel.mandatory as mandatory',
				'customer_datamodel.active as active')
			.join('customer_datatype', 'customer_datamodel.fk_datatype_id', '=', 'customer_datatype.id')
			.where({
				'fk_customer_id': customerid
			})
			.orderBy('id', 'asc')
			.then(function(rows) {
				var datamodel = [];

				for(var i = 0; i < rows.length; i++) {
					datamodel[i] = {
						'id': rows[i].id,
						'datatype': rows[i].datatype,
						'name': rows[i].name,
						'mandatory': rows[i].mandatory,
						'active': rows[i].active
					};
				}

				callback(datamodel);
			})
			.catch(function(err) {
				logger.error('Could not get datamodel from database --- ' + err);
			});
	},
	createTicket: function (ticket, callback) {

		knex('ticket').returning('id').insert([{
			'caption': ticket.caption,
			'description': ticket.description,
			'fk_user_id': ticket.user.id,
			'fk_agent_id': ticket.agent.id
		}]).then(function(id) {
			id = id[0];

			for(var i = 0; i < ticket.properties.length; i++) {
				knex('ticket_datamodel')
					.insert({
						'fk_ticket_id': id,
						'fk_datamodel_id': ticket.properties[i].datamodel_id,
						'value': ticket.properties[i].value
					})
					.then(function(data) {

					})
					.catch(function(err) {
						logger.error(err);
					});
			}

			if(id > 0) {

				callback(id, null);
			}
		})
		.catch(function(err) {
			logger.error('Could not create ticket in database --- ' + err);
			callback(null, err);
		});
	},
  getUsers: function (callback) {
    knex('user').select('id', 'first_name', 'last_name', 'email', 'fk_customer_id',
      'create_timestamp', 'update_timestamp', 'active')
      .then(function(rows) {

        var users = [];

        for(var i = 0; i < rows.length; i++) {
          users[i] = objects.setUserObject(rows[i]);
        }

        callback(users);

      }).catch(function(err) {
        logger.error('Could not get users from database --- ' + err);
      });
  },
  getUsersByCustomerId: function(customerid, callback) {
    knex('user')
      .select('id', 'first_name', 'last_name', 'email', 'fk_customer_id',
        'create_timestamp', 'update_timestamp', 'active')
      .where({
        'fk_customer_id': customerid
      })
      .orderBy('id', 'asc')
      .then(function(rows) {
        var users = [];

        for(var i = 0; i < rows.length; i++) {
          users[i] = objects.setUserObject(rows[i]);
        }

        callback(users);
      })
      .catch(function(err) {
        logger.error('Could not get users by customer id from database --- ' + err);
      });
  },
  getActiveUsersByCustomerId: function(customerid, callback) {
    knex('user')
      .select('id', 'first_name', 'last_name', 'email', 'fk_customer_id',
        'create_timestamp', 'update_timestamp', 'active')
      .where({
        'fk_customer_id': customerid,
        'active': true
      })
      .orderBy('id', 'asc')
      .then(function(rows) {
        var users = [];

        for(var i = 0; i < rows.length; i++) {
          users[i] = objects.setUserObject(rows[i]);
        }

        callback(users);
      })
      .catch(function(err) {
        logger.error('Could not get users by customer id from database --- ' + err);
      });
  },
  createUser: function (user, callback) {
    knex('user').returning('id').insert({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      active: user.active,
      password: user.password,
      fk_customer_id: user.fk_customer_id,
      create_timestamp: moment().format()
    }).then(function(id) {
      callback(id[0]);
    }).catch(function(err) {
      logger.error('Could not create user in database --- ' + err);
    });
  },
  updateUserPassword: function(user_id, hash, callback) {

    //Update agent object
    knex('user').returning('id').update({
      'password': hash
    }).where({
      'id': user_id
    }).then(function(id) {
      callback(id[0]);
    }).catch(function(err) {
      logger.error("Could not update user (id: '" + user_id + "') password in database --- " + err);
    });
  },
  updateUser: function(user, callback) {
    knex('user').returning('id').update({
      'first_name': user.first_name,
      'last_name': user.last_name,
      'email': user.email
    }).where({
      id: user.id
    }).then(function(id) {
      callback(id[0]);
    }).catch(function(err) {
      logger.error('Could not update user in database --- ' + err);
    });
  },
  deleteUser: function(user_id, callback) {
    knex('user').returning('active').update({
      'active': false
    }).where({
      id: user_id
    }).then(function(active) {
      //If the active value is false, the user has been set inactive.
      if(!active) {
        callback(true);
      } else {
        callback(false);
      }
    }).catch(function(err) {
      logger.error('Could not update user in database --- ' + err);
    });
  },
  getAssignmentsByUser: function(agent_id, callback) {
    knex('ticket')
      .select('ticket.id', 'ticket.description', 'ticket.caption',
        'ticket.create_timestamp', 'ticket.update_timestamp',
        'ticket.fk_agent_id', 'ticket.fk_user_id', 'ticket.solved',
        'ticket.archived', 'user.fk_customer_id')
      .join('user', 'ticket.fk_user_id', 'user.id')
      .where({
        'ticket.fk_agent_id': agent_id,
        'ticket.solved': false,
        'ticket.archived': false
      })
      .then(function(rows) {
        var responseArr = [];

        for(var i = 0; i < rows.length; i++) {
          var obj = objects.setTicketObject(rows[i]);
          obj.customer_id = rows[i].fk_customer_id;

          responseArr.push(obj);
        }

        callback(responseArr);
      }).catch(function(err) {
        logger.error('Could not get assignments from database --- ' + err);
      });
  },
  getCustomer: function (id, callback) {
    knex('customer')
      .select('id', 'name', 'email_contact', 'create_timestamp',
        'update_timestamp', 'fk_created_by_admin', 'active')
      .where({
        'id': id
      })
      .then(function(rows) {

        callback(objects.setCustomerObject(rows[0]));
      })
      .catch(function(err) {
        logger.error('Could not select customer from database --- ' + err);
      });
  },
  getCustomers: function (callback) {
    knex('customer')
      .select('id', 'name', 'email_contact', 'create_timestamp',
        'update_timestamp', 'fk_created_by_admin', 'active')
      .then(function(rows) {
        var customers = [];

        for(var i = 0; i < rows.length; i++) {

          try {
            customers[i] = objects.setCustomerObject(rows[i]);
          } catch (err) {
            logger.error(err);
          }
        }

        callback(customers);
      })
      .catch(function(err) {
        logger.error('Could not select customers from database --- ' + err);
      });
  },
  disableCustomer: function (id, callback) {
    knex('customer').returning('id').update({
      active: false
    }).where({
      id: id
    }).then(function(id) {
      callback(id[0]);
    }).catch(function(err) {
      logger.error('Could not disable customer in database --- ' + err);
    });
  },
  enableCustomer: function (id, callback) {
    knex('customer').returning('id').update({
      active: true
    }).where({
      id: id
    }).then(function(id) {
      callback(id[0]);
    }).catch(function(err) {
      logger.error('Could not enable customer in database --- ' + err);
    });
  },
  updateCustomer: function (customer, callback) {
    knex('customer').returning('id').update({
      'name': customer.name
    }).where({
      'id': customer.id
    }).then(function(id) {
      callback(id[0]);
    }).catch(function(err) {
      logger.error('Could not update customer in database --- ' + err);
    });
  },
  createCustomer: function (customer, callback) {
    knex('customer').insert({
      'name': customer.name,
      'email_contact': customer.email_contact,
      'active': true,
      'fk_created_by_admin': customer.admin.id,
      'email_mailbox': customer.imap_email,
      'username_mailbox': customer.mailbox_user,
      'password_mailbox': customer.mailbox_password
    })
    .returning('id')
    .then(function(id) {
      callback(id[0], null);
    })
    .catch(function(err) {
      callback(null, err);
    });
  },
  solveTicket: function (ticket_id, callback, error) {

    knex('ticket').update({
      'solved': true
    })
    .where({
      'id': ticket_id
    })
    .returning('solved')
    .then(function(solved) {
      callback(solved[0]);
    })
    .catch(function(err) {
      error( { 'code': null, 'msg': null } );
    });
  },
  archiveTicket: function (ticket_id, callback, error) {

    knex('ticket').update({
      'archived': true
    })
    .where({
      'id': ticket_id
    })
    .returning('archived')
    .then(function(archived) {
      callback(archived[0]);
    })
    .catch(function(err) {
      error( { 'code': null, 'msg': null } );
    });
  },
  getAgent: function (id, callback) {
    knex('agent')
      .select('id', 'first_name', 'last_name', 'create_timestamp', 'update_timestamp',
        'is_admin', 'email', 'active', 'login_pw_change')
      .where({
        'id': id
      })
      .then(function(rows) {
        var agent = objects.setAgentObject(rows[0]);

        callback(agent);
      })
      .catch(function(err) {
        logger.error('Could not select agent from database with ID: ' + id + ' --- ' + err);

        callback(null);
      });
  },
  getAgents: function (callback) {
    knex('agent')
      .select('id', 'first_name', 'last_name', 'create_timestamp', 'update_timestamp',
        'is_admin', 'email', 'active')
      .then(function(rows) {

        var agents = [];

        for(var i = 0; i < rows.length; i++) {
          agents[i] = objects.setAgentObject(rows[i]);
        }

        callback(agents);
      })
      .catch(function(err) {
        logger.error('Could not get agents from database --- ' + err);
      });
  },
  getActiveAgents: function (callback) {
    knex('agent')
      .select('id', 'first_name', 'last_name', 'create_timestamp', 'update_timestamp',
        'is_admin', 'email', 'active')
      .where({
        'active': true
      })
      .then(function(rows) {

        var agents = [];

        for(var i = 0; i < rows.length; i++) {
          agents[i] = objects.setAgentObject(rows[i]);
        }

        callback(agents);
      })
      .catch(function(err) {
        logger.error('Could not get agents from database --- ' + err);
      });
  },
  createAgent: function (agent, callback) {
    knex('agent').returning('id').insert({
      first_name: agent.first_name,
      last_name: agent.last_name,
      email: agent.email,
      is_admin: agent.is_admin,
      active: agent.active,
      password: agent.password
    }).then(function(id) {
      callback(id[0]);
    }).catch(function(err) {
      logger.error('Could not create agent in database --- ' + err);
    });
  },
  setNewAgentPassword: function (id, hash, callback) {
    //Update agent object
    knex('agent').returning('id').where({
      id: id
    }).update({
      password: hash
    }).then(function(id) {
      callback(id[0]);
    }).catch(function(err) {
      logger.error('Could not update agent in database --- ' + err);
    });
  },
  updateAgent: function(agent, callback) {
    knex('agent').returning('id').update({
      first_name: agent.first_name,
      last_name: agent.last_name,
      email: agent.email,
      is_admin: agent.is_admin,
      active: agent.active,
      update_timestamp: moment().format()
    }).where({
      id: agent.id
    }).then(function(id) {
      callback(id[0]);
    }).catch(function(err) {
      logger.error('Could not update agent in database --- ' + err);
    });
  },

  getTicket: function (id, callback) {

    knex('ticket')
      .select('id', 'description', 'caption', 'create_timestamp', 'update_timestamp',
        'fk_agent_id', 'fk_user_id', 'solved', 'archived')
      .where({
        'id': id
      })
      .then(function(rows) {
        if(rows.length == 1) {

          var ticket = objects.setTicketObject(rows[0]);

          database.getCommentsByTicketId(ticket.id, function(comments) {
            ticket.comments = comments;


            //Sort comments
            var sortedComments = [];
            for(var i = 0; i < ticket.comments.length; i++) {
              if(ticket.comments[i].previous_comment.id == null) {
                sortedComments.push(ticket.comments[i]);
                break;
              }
            }
            for(var i = 0; i < ticket.comments.length; i++) {
              if(ticket.comments[i].previous_comment.id != null) {
                sortedComments.push(ticket.comments[i]);
              }
            }
            ticket.comments = sortedComments;

            database.getUser(ticket.user.id, function(user) {
              ticket.user = user;

              database.getAgent(ticket.agent.id, function(agent) {
                ticket.agent = agent;

                database.getTicketDatamodel(ticket.user.customer.id, id, function(datamodel) {
                  ticket.datamodel = datamodel;

                  callback(ticket);
                });
              });
            });
          });
        } else {

        }
      }).catch(function(err) {
        logger.error('Could not get ticket from database --- ' + err);
      });
  },
  getTicketsByCustomerId: function (customerid, callback) {
    knex('ticket')
      .select('ticket.id', 'ticket.description', 'ticket.caption', 'ticket.create_timestamp', 'ticket.update_timestamp',
        'ticket.fk_agent_id', 'ticket.fk_user_id', 'ticket.solved', 'ticket.archived')
      .join('user', 'ticket.fk_user_id', '=', 'user.id')
      .where({
        'user.fk_customer_id': customerid,
        'archived': false
      })
      .orderBy('ticket.update_timestamp', 'desc')
      .then(function(rows) {

        var tickets = [];

        for(var i = 0; i < rows.length; i++) {
          tickets[i] = objects.setTicketObject(rows[i]);
        }

        callback(tickets);

      }).catch(function(err) {
        logger.error('Could not get tickets by customer id from database --- ' + err);
      });
  },
  createTicket: function (ticket, callback) {


    knex('ticket').returning('id').insert([{
      'caption': ticket.caption,
      'description': ticket.description,
      'fk_user_id': ticket.user.id,
      'fk_agent_id': ticket.agent.id
    }]).then(function(id) {
      id = id[0];

      for(var i = 0; i < ticket.properties.length; i++) {
        knex('ticket_datamodel')
          .insert({
            'fk_ticket_id': id,
            'fk_datamodel_id': ticket.properties[i].datamodel_id,
            'value': ticket.properties[i].value
          })
          .then(function(data) {

          })
          .catch(function(err) {
            logger.error(err);
          });
      }

      if(id > 0) {

        callback(id, null);
      }
    })
    .catch(function(err) {
      logger.error('Could not create ticket in database --- ' + err);
      callback(null, err);
    });
  },
  assignAgent: function (agent_id, ticket_id, callback, error) {
    if(agent_id == null) {
      database.getTicket(ticket_id, function(ticket) {
        if(ticket.solved) {
          database.privateAssignAgent(agent_id, ticket_id, callback, error);
        } else {
          error({'code': 3});
        }
      });
    } else {
      database.privateAssignAgent(agent_id, ticket_id, callback, error);
    }
  },

  privateAssignAgent: function (agent_id, ticket_id, callback, error) {
    knex('ticket')
      .returning('id')
      .update({
        fk_agent_id: agent_id,
        solved: false,
        update_timestamp: moment().format()
      })
      .where({
        'id': ticket_id
      })
      .then(function(id) {
        callback(id[0]);
      })
      .catch(function(err) {
        error(err);
        logger.error('Could not assign ticket to agent in database --- ' + err);
      });
  },
  createComment: function (comment, callback) {

    if(comment.user.id == null || comment.user.id == '') {
      comment.user.id = null;
    }

    if(comment.agent.id == null || comment.agent.id == '') {
      comment.agent.id = null;
    }

    //Don't know what I coded her, but it works
    knex.select('id').from('comment').where({
      'fk_ticket_id': comment.ticket.id
      }).orderBy('fk_previous_comment_id', 'asc').limit(1).then(function(rows) {

        if(rows.length > 0) {

          knex('comment').returning('id').insert([{
            'description': comment.description,
            'fk_agent_id': comment.agent.id,
            'fk_ticket_id': comment.ticket.id,
            'fk_user_id': comment.user.id,
            'fk_previous_comment_id': rows[0].id
          }]).then(function(id) {
            callback(id, null);
          }).catch(function(err) {
            callback(null, err);
          });

        } else {

          //There are no previous comments, so we will create the initial one

          knex('comment').returning('id').insert([{
            'description': comment.description,
            'fk_agent_id': comment.agent.id,
            'fk_user_id': comment.user.id,
            'fk_ticket_id': comment.ticket.id
          }]).then(function(id) {

            callback(id, null);
          }).catch(function(err) {
            callback(null, err);
          });
        }
    });
  },
  getCommentsByTicketId: function (ticketid, callback) {
    knex('comment')
      .select('id', 'description', 'fk_user_id', 'fk_agent_id',
        'fk_ticket_id', 'fk_previous_comment_id', 'create_timestamp')
      .where({
        'fk_ticket_id': ticketid
      })
      .orderBy('fk_previous_comment_id', 'asc')
      .then(function(rows) {
        var comments = [];

        for(var i = 0; i < rows.length; i++) {
          comments[i] = objects.setCommentObject(rows[i]);
        }

        callback(comments);
      })
      .catch(function(err) {
        logger.error('Could not get comments by ticket id from database --- ' + err);
      });
  },

  getDatatypes: function(callback) {
    knex('customer_datatype')
      .select('id', 'datatype')
      .orderBy('id', 'desc')
      .then(function(rows) {
        var datatypes = [];

        for(var i = 0; i < rows.length; i++) {
          datatypes[i] = {
            'id': rows[i].id,
            'datatype': rows[i].datatype
          };
        }

        callback(datatypes);
      })
      .catch(function(err) {
        logger.error('Could not get datatypes from database --- ' + err);
      });
  },
  getDatamodel: function(customerid, callback) {
    //Select the customer datamodel and do join to datatype table to get the datatype
    knex('customer_datamodel')
      .select('customer_datamodel.id as id', 'customer_datatype.datatype as datatype',
        'customer_datamodel.name as name', 'customer_datamodel.mandatory as mandatory',
        'customer_datamodel.active as active')
      .join('customer_datatype', 'customer_datamodel.fk_datatype_id', '=', 'customer_datatype.id')
      .where({
        'fk_customer_id': customerid
      })
      .orderBy('id', 'asc')
      .then(function(rows) {
        var datamodel = [];

        for(var i = 0; i < rows.length; i++) {
          datamodel[i] = {
            'id': rows[i].id,
            'datatype': rows[i].datatype,
            'name': rows[i].name,
            'mandatory': rows[i].mandatory,
            'active': rows[i].active
          };
        }

        callback(datamodel);
      })
      .catch(function(err) {
        logger.error('Could not get datamodel from database --- ' + err);
      });
  },
  getTicketDatamodel: function(customerid, ticketid, callback) {

    //Select the specific values for one ticket.
    database.getDatamodel(customerid, function(datamodel_temp) {
      knex('ticket_datamodel')
        .select('id', 'fk_datamodel_id', 'value')
        .where({
          'fk_ticket_id': ticketid
        })
        .then(function(rows) {

          //Eliminate inactive properties
          var datamodel = []
          for(var i = 0; i < datamodel_temp.length; i++) {
            if(datamodel_temp[i].active) {
              datamodel[i] = datamodel_temp[i];
            }
          }

          //Set unsetted properties on null
          for(var u = 0; u < datamodel.length; u++) {
            datamodel[u].value = null;
          }

          //Connect the values with the datamodel
          for(var i = 0; i < rows.length; i++) {

            for(var u = 0; u < datamodel.length; u++) {
              if(rows[i].fk_datamodel_id == datamodel[u].id) {
                datamodel[u].value = rows[i].value;
                break;
              }
            }
          }

          callback(datamodel);

        })
        .catch(function(err) {
          logger.error('Could not get ticket datamodel from database --- ' + err);
        });
    });
  },
  changeAgentPassword: function(agent_id, new_password, callback) {
    knex('agent')
      .returning('login_pw_change')
      .update({
        login_pw_change: false,
        password: new_password
      })
      .where({
        'id': agent_id
      })
      .then(function(result) {
        callback(result[0], null);
      })
      .catch(function(err) {
        callback(null, err);

        logger.error('Could not update password for agent --- ' + err);
      });
  },
  resetAgentPassword: function(agent_email, new_password, callback) {
    knex('agent')
      .returning('id')
      .update({
        login_pw_change: true,
        password: new_password
      })
      .where({
        'email': agent_email
      })
      .then(function(result) {
        callback(result[0], null);
      })
      .catch(function(err) {
        callback(null, err);

        logger.error('Could not reset password for agent --- ' + err);
      });
  },
  getBlacklist: function(callback) {
    knex('blacklist')
      .select('id', 'email')
      .then(function(rows) {
        callback(rows);
      })
      .catch(function(err) {
        logger.error('Could not get blacklist from database --- ' + err);
      });
  },

  sendEmail: function(customer_id, description, subject, to) {
    database.getCustomer(customer_id, function (customer) {
      var message = {
        'text': { 'raw': description },
        'subject': subject,
        'to': to,
        'from': customer.email_mailbox,
        'attachments': []
      };

      var server = {
        'user': customer.username_mailbox,
        'password': customer.password_mailbox,
        'host': customer.email_mailbox_stmp
      }

      email.send(server, email);
    });
  }
}

module.exports = database;
