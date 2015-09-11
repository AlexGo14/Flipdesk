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
var express = require('express');
var router = express.Router();
var database = require('../packages/database');

router.get('/', function (req, res) {

	if(req.user){
		// already logged in
		res.json( {'success': true} );
	} else {
		// not logged in, show the login form, remember to pass the message
		// for displaying when error happens
		res.json( {'success': false} );
		// and then remember to clear the message
		req.session.messages = null;
	}
});

router.post('/', function( req, res, next) {
	// ask passport to authenticate
	passport.authenticate('local', function(err, user, info) {
		if (err) {
			// if error happens
			return next(err);
		}

		if (!user) {
			// if authentication fail, get the error message that we set
			// from previous (info.message) step, assign it into to
			// req.session and redirect to the login page again to display
			req.session.messages = info.message;

			return res.json( {'success': false, 'message': info.message });
		}

		// if everything's OK
		req.logIn(user, function(err) {
			if (err) {
				req.session.messages = "Error";
				return next(err);
			}

			database.getAgent(user.id, function(agent) {
				if(agent.active) {
					req.session.messages = "Login successful";

					return res.json( {'success': true , 'login_pw_change': agent.login_pw_change});
				} else {
					req.session.messages = "User not active";

					return res.json({'success': false, 'message': 'User is inactive'});
				}
			});
		});

	})(req, res, next);
});

router.get('/logout', function ( req, res) {
	if(req.isAuthenticated()){
		req.logout();
		//req.session.messages = req.i18n.__("Log out successfully");
		req.session.message = 'Log out successfully';
	  }
    res.redirect('/');
});

module.exports = router;
