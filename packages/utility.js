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
var nconf = require('nconf');
var crypto = require('crypto');

var utility = {
	requireAuthentication: function (req, res, next){
		// check if the user is logged in
		if(!req.isAuthenticated()){
			req.session.messages = "You need to login to view this page";
			res.redirect('/');
		}
		next();
	},
	//Configure nconf
	configureNconf: function() {
		return nconf.argv()
		     .env()
		     .file({ file: 'config.json' });
	},
	encryptString: function(input) {
		var cipher = crypto.createCipher('aes-256-cbc', nconf.get('keys').imap_mailbox_password)
	  var crypted = cipher.update(input,'utf8','hex')
	  crypted += cipher.final('hex');
	  return crypted;
	},
	decryptString: function(input) {
		var decipher = crypto.createDecipher('aes-256-cbc', nconf.get('keys').imap_mailbox_password)
		var dec = decipher.update(input,'hex','utf8')
		dec += decipher.final('utf8');
		return dec;
	}
}

nconf = utility.configureNconf();
module.exports = utility;
