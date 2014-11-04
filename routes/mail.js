Imap = require('imap'),
    inspect = require('util').inspect;
MailParser = require("mailparser").MailParser,
    mailparser = new MailParser();


mailparser.on("end", function(mail_object){
	console.log('es wird gesucht');
	//if(mail_object.text != undefined) {
		
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
mailFunction.imap = {};
mailFunction.start = function (imap) {
		imap.once('ready', function() {
			openInbox(function(err, box) {
				if (err) throw err;
				
				imap.search(['UNSEEN'], function(err, results) {
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
		
		
		imap.once('error', function(err) {
			console.log(err);
		});

		imap.once('end', function() {
			console.log('Connection ended');
		});
		
		function openInbox(cb) {
			imap.openBox('INBOX', false, cb);
		};

		imap.connect();
	};

mailFunction.send = function() {
	
}

module.exports = mailFunction;
