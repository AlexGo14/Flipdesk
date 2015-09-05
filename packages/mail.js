var MailListener = require("mail-listener2");
var email = require("emailjs");
var objects = require("./objects");
var database = require("./database");

var mail_module = {
	start: function() {
		mail_module.getCustomersAdminSettings(function(customers) {

			for(var i = 0; i < customers.length; i++) {

				if(!customers[i].username_mailbox && !customers[i].password_mailbox
						&& !customers[i].email_mailbox_imap) {

					var mailListener = new MailListener({

						username: customers[i].username_mailbox,
						password: customers[i].password_mailbox,
						host: customers[i].email_mailbox_imap,
						port: 993,
						tls: true,
						tlsOptions: { rejectUnauthorized: false },
						mailbox: "INBOX", // mailbox to monitor
						searchFilter: ["UNSEEN"], // the search filter being used after an IDLE notification has been retrieved
						markSeen: false, // all fetched email willbe marked as seen and not fetched next time
						fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
						mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib.
						attachments: true, // download attachments as they are encountered to the project directory
						attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
					});


					mailListener.on("server:connected", function(){
						logger.info('Established IMAP connection to ' + mailListener.imap._config.host);
					});

					mailListener.on("server:disconnected", function(){
						logger.info('Disconnected IMAP connection to ' + mailListener.imap._config.host);
					});

					mailListener.on("error", function(err){
						console.log(err);
					});

						//Get the customer by the imap host entry
						/*utility.getCustomerByImapMailbox(mailListener.imap._config.host, function(customer) {

							//Get all users and find the one user who wrote the email
							utility.getUsersByCustomerId(customer.id, function(users) {

								for(var i = 0; i < users.length; i++) {

									if(mail.headers.from.indexOf(users[i].email)) {

										//The user has been found. He is users[i]

										if(mail.subject.indexOf('#FlipID') != -1) {
											//A user has send a new comment via email. We will process it.
											var id_position = mail.subject.indexOf('#FlipID:') + 8;
											var end_position = mail.subject.indexOf('#', id_position);

											var ticket_id = mail.subject.substr(id_position, end_position - id_position);


											utility.createComment({
												'description': mail.html,
												'ticket': {
													'id': ticket_id
												},
												'agent': {
													'id': null
												},
												'user': {
													'id': users[i].id
												}
											}, function(id, error) {
												if(!error) {
													logger.info('Created comment ID: ' + id + ' for ticket ID: ' + ticket_id);
												} else {
													logger.error(error);
												}
											});

										} else {
										//Create a new ticket, which has been mailed by a user.

										//Now, we need the datamodel for the company
										utility.getDatamodel(1, function(datamodel) {
												var properties = [];

												for(var u = 0; u < datamodel.length; u++) {
													properties[u] = {
														'datamodel_id': datamodel[u].id,
														'value': null
													}
												}

												//The ticket is ready to be created.
												utility.createTicket({
													'caption': mail.subject,
													'description': mail.html,
													'user': { 'id': users[i].id },
													'agent': { 'id': null },
													'properties': properties
												}, function(id, err) {

												if(!err) {
													logger.info('Created ticket from imap scan. Ticket-ID: ' + id);
												} else {
													logger.error(err);
												}
											});
										});
										}

										break;
									}

							});
						});
					});*/

					/*mailListener.on("attachment", function(attachment){
						console.log(attachment.path);
					});*/
				} else {
					logger.warn("Couldn't establish connection to customers IMAP-server. Missing IMAP credentials.");
				}
			}
		});
	},
	getCustomersAdminSettings: function (callback) {

	  knex('customer')
	    .select('id', 'name', 'email_contact', 'create_timestamp',
	      'update_timestamp', 'fk_created_by_admin', 'active',
	      'email_mailbox', 'username_mailbox', 'password_mailbox', 'email_mailbox_imap',
	      'email_mailbox_smtp')
	    .then(function(rows) {
	      var customers = [];

	      for(var i = 0; i < rows.length; i++) {

	        try {
	          customers[i] = objects.setCustomerObjectAdminsSettings(rows[i]);
	        } catch (err) {
	          logger.error(err);
	        }
	      }

	      callback(customers);
	    })
	    .catch(function(err) {
	      logger.error("Could not fetch customer data: mail.getCustomersAdminSettings --- " + err);
	    });
	},
	send: function(server, email) {

		if(!server.user && !server.password && !server.host) {
			//Process server object
			var server = email.server.connect({
				user: server.user,
				password: server.password,
				host: server.host,
				ssl: true
			});

			//Process message object
			var message = {
				text: email.text.raw,
				from: email.from,
				to: email.to,
				subject: email.subject,
				//attachment:
				//[
				//	{ data: email.text.html, alternative: true }
				//]
			};

			//Check if any attachments are available and if yes, add them to the array.
			for(var i = 0; i < message.attachments.length; i++) {
				message.attachment.push( { path: message.attachments[i].path,
					type: message.attachments[i].type, name: message.attachments[i].name
				});
			}

			//Send the message
			server.send(message, function(err, message) {
				if(err) {
					logger.error(err);
				} else {
					logger.info('Email has been send to: ' + message.to + ' from ' + message.from);
				}
			});
		} else {
			logger.error("Couldn't establish connection to SMTP server. Missing SMTP credentials. Check config.js");
		}
	},
	notificationNewTicket: function(new_ticket) {

		var server = mail_module.getSmtpServer();

		database.getAgent(new_ticket.agent.id, function(agent) {
			// send the message and get a callback with an error or details of the message that was sent
			server.send({
				text: "Dear agent a new ticket has been created. Please check your support dashboard.\r\r\rTicket content: " + new_ticket.description,
				from: nconf.get('mail').email,
				to:  agent.email,
				subject: "New ticket: " + new_ticket.caption
			}, function(err, message) {
				if(err) {
					logger.error(err);
				} else {
					logger.info(message);
				}
			});
		});
	},
	notificationNewComment: function (new_comment) {
		var server = mail_module.getSmtpServer();

		//Find the new comment.
		var comment = {};
		for(var i = 0; i < new_comment.ticket.comments.length; i++) {
			if(new_comment.ticket.comments[i].id == new_comment.comment.id) {
				comment = new_comment.ticket.comments[i];
			}
		}

		server.send({
			text: "Dear agent a new comment has been created for your ticket \"" + new_comment.ticket.caption + "\".\r\rPlease check your support dashboard.\r\r\rComment: " + comment.description + "\r\r\rTicket content: " + new_comment.ticket.description,
			from: nconf.get('mail').email,
			to:  new_comment.ticket.agent.email,
			subject: "New comment for ticket " + new_comment.ticket.caption
		}, function(err, message) {
			if(err) {
				logger.error(err);
			} else {
				logger.info(message);
			}
		});
	},
	sendAgentWelcomeEmail: function (new_agent, password) {
			var server = mail_module.getSmtpServer();

			var description = "Hello " + new_agent.first_name + " " + new_agent.last_name + ",\r\r" +
				"you are now registered as a support agent for " + nconf.get('company').name + ".\r\r" +
				"Please login with your email address \"" + new_agent.email + "\" and the password \"" + password + "\".\r" +
				"This password is temporary and you will have to change it at your first login.";

			server.send({
				text: description,
				from: nconf.get('mail').email,
				to:  new_agent.email,
				subject: "Your agent account has been created"
			}, function(err, message) {
				if(err) {
					logger.error(err);
				} else {
					logger.info(message);
				}
			});
	},
	sendUserWelcomeEmail: function (new_user, password) {
			var server = mail_module.getSmtpServer();

			var description = "Hello " + new_user.first_name + " " + new_user.last_name + ",\r\r" +
				"you are now registered as user for the support service of " + nconf.get('company').name + ".";

			server.send({
				text: description,
				from: nconf.get('mail').email,
				to:  new_user.email,
				subject: "A account has been created for you"
			}, function(err, message) {
				if(err) {
					logger.error(err);
				} else {
					logger.info(message);
				}
			});
	},
	sendAgentResetEmail: function (agent, password) {
		var server = mail_module.getSmtpServer();

		var description = "Hello " + agent.first_name + " " + agent.last_name + ",\r\r" +
			"we have reset your password.\r" +
			"You find a temporary password in this email.\r\r\r" +
			"Please login with your email address \"" + agent.email + "\" and the password \"" + password + "\".\r" +
			"This password is temporary and you will have to change it at your first login.";

		server.send({
			text: description,
			from: nconf.get('mail').email,
			to:  agent.email,
			subject: "Your password has been reset"
		}, function(err, message) {
			if(err) {
				logger.error(err);
			} else {
				logger.info(message);
			}
		});
	},
	getSmtpServer: function() {
		var server  = email.server.connect({
			user: nconf.get('mail').server.username,
			password: nconf.get('mail').server.password,
			host: nconf.get('mail').server.smtp.host,
			tls: true,
			port: nconf.get('mail').server.smtp.port
		});

		return server;
	}
}

mail_module.start();

module.exports = mail_module;
