Imap = require('imap'),
    inspect = require('util').inspect;
MailParser = require("mailparser").MailParser,
    mailparser = new MailParser();
var emailjs     = require("emailjs");

//TODO: Logindata
mailparser.smtpServer = email.server.connect({
   user:    "username", 
   password:"password", 
   host:    "smtp.your-email.com", 
   ssl:     true
});


mailparser.on("end", function(mail_object){
	console.log('es wird gesucht');
		
	knex('user').select('id').where({
			email: mail_object.from[0].address
	}).then(function(id) {
		var text;
		if(mail_object.text != undefined) {
			text = mail_object.text;
		} else {
			text = mail_object.html;
		}
		
		if(id.length == 1) {
			if(mail_object.inReplyTo == undefined) {
				
				knex('ticket').insert({
					description: text,
					caption: mail_object.subject,
					fk_user_id: id[0].id
				})
				.then(function() {
					console.log('added new ticket');
				})
				.catch(function(err) {
					console.log(err);
				});
		
			} else {
				/*knex('comment').insert({
					description: mail_object.text,
					fk_user_id: id,
					fk_ticket_id: 
					fk_previous_comment_id: 
				}).
				catch(function(err) {
					console.log(err);
				});*/
			}
		}
	});
});

mailFunction = {};

mailFunction.imap = new Imap({
	user: 'jogiere@gmail.com',
	password: 'NfbPh5wd',
	host: 'imap.gmail.com',
	port: 993,
	tls: true
});

mailFunction.start = function () {
		this.prototype.imap.once('ready', function() {
			openInbox(function(err, box) {
				if (err) throw err;
				
				this.prototype.imap.search(['UNSEEN'], function(err, results) {
					if (err) throw err;
					console.log(results);
					if (results.length == 0) return;
					
					var f = imap.fetch(results, {
						bodies: '',
						markSeen: true
					});
					
					f.on('message', function(msg, seqno) {
						
						var prefix = '(#' + seqno + ') ';
						
						msg.on('body', function(stream, info) {
							
							stream.pipe(mailparser);
						});
						
						msg.once('end', function() {
							
						});
					});
					
					f.once('error', function(err) {
						console.log('Fetch error: ' + err);
					});
					
					f.once('end', function() {
						imap.end();
					});
				});
			});
		});
		
		
		this.prototype.imap.once('error', function(err) {
			console.log(err);
		});

		this.prototype.imap.once('end', function() {
			console.log('Connection ended');
		});
		
		function openInbox(cb) {
			this.prototype.imap.openBox('INBOX', false, cb);
		};

		this.prototype.imap.connect();
	};

mailFunction.sendNewTicket = function(ticket) {
	
}

mailFunction.sendComment = function(ticket, comment) {
	
}

mailFunction.sendAgentWelcomeEmail = function(firstname, lastname, email, password) {
	this.prototype.smtpServer.send({
		text:    'Hello ' + firstname + ' ' + lastname + ', you have been registered as an agent ' + 
			'at the Flipdesk service of ' + nconf.get('company').name + '. Your password is ' + 
			'\'' + password + '\'. You will be informed to change your password once you log in.', 
		from:    "you <username@your-email.com>", //TODO set email mailbox
		to:      firstname + ' ' + lastname + '<' + email + '>',
		subject: 'Registration at Flipdesk ' + nconf.get('company').name
		}, function(err, message) { 
			console.log(err || message); 
	});
}

mailFunction.sendUserWelcomeEmail = function(firstname, lastname, email, password) {
	this.prototype.smtpServer.send({
		text:    'Hello ' + firstname + ' ' + lastname + ', you have been registered as a new user ' + 
			'at the Flipdesk service of ' + nconf.get('company').name + '. Your password is ' + 
			'\'' + password + '\'. You will be informed to change your password once you log in.' + 
			'Unfortunately, it is not possible to login as a user at the moment', 
		from:    "you <username@your-email.com>", //TODO set email mailbox
		to:      firstname + ' ' + lastname + '<' + email + '>',
		subject: 'Registration at Flipdesk ' + nconf.get('company').name
		}, function(err, message) { 
			console.log(err || message); 
	});
}

module.exports = mailFunction;
