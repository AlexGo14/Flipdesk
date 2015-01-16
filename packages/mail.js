var MailListener = require("mail-listener2");
var utility = require("../routes/utility");


var mailListener = new MailListener({
	username: "jogiere@gmail.com",
	password: "NfbPh5wd",
	host: "imap.gmail.com",
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
  console.log("imapDisconnected");
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




mailFunction = {};

mailFunction.sendNewTicket = function(ticket) {
	
}

mailFunction.sendComment = function(ticket, comment) {
	
}

mailFunction.sendAgentWelcomeEmail = function(firstname, lastname, email, password) {
	
}

mailFunction.sendUserWelcomeEmail = function(firstname, lastname, email, password) {
	
}

module.exports = mailListener;
