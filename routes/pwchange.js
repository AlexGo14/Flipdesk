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
var utility = require('../packages/utility');
var nconf = utility.configureNconf();
var database = require('../packages/database');

router.get('/', utility.requireAuthentication, function(req, res) {
    res.render('pwchange', { title: 'Password change', company: nconf.get('company').name
  });
});

//Change password
router.post('/', utility.requireAuthentication, function(req, res) {

  if(req.body.password && req.user.id) {

    bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash(req.body.password, salt, function(err, hash) {

        if(!err) {
          database.changeAgentPassword(req.user.id, hash, function(success, err) {
            if(!err) {
              res.json({'success': true});
            } else {
              logger.error(err);
              res.json({'success': false});
            }
          });
        } else {
          logger.error(err);
          res.json({'success': false});
        }
			});
		});
  }
});

module.exports = router;
