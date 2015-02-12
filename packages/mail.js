var MailListener = require("mail-listener2");
var email = require("emailjs");
var utility = require("../routes/utility");

var module = {
	start: function() {
		
		utility.getCustomersAdminSettings(function(customers) {
			
			for(var i = 0; i < customers.length; i++) {
				var mailListener = new MailListener({
					username: customers[i].username_mailbox,
					password: customers[i].password_mailbox,
					host: customers[i].email_mailbox_imap,
					port: 993, // imap port
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

				mailListener.on("mail", function(mail, seqno, attributes){
				
				
				//Get the customer by the imap host entry
				utility.getCustomerByImapMailbox(mailListener.imap._config.host, function(customer) {
					
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
						}
						
					});
				});
			});

				mailListener.on("attachment", function(attachment){
				  console.log(attachment.path);
				});
			}

		});
	},
	send: function(server, email) {
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
	}
}

module.start();


module.exports = module;
