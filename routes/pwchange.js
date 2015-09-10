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
