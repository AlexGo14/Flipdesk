var express = require('express');
var utility = require('../packages/utility');
var nconf = utility.configureNconf();
var database = require('../packages/database');
var email = require('../packages/mail');
var generatePassword = require('password-generator');

var router = express.Router();

router.get('/', function(req, res) {
	res.render('password-reset', {});
});

//Reset password
router.post('/', function(req, res) {

  if(req.body.email) {

    bcrypt.genSalt(10, function(err, salt) {
			var gen_password = generatePassword(12, false);

			bcrypt.hash(gen_password, salt, function(err, hash) {

        if(!err) {
          database.resetAgentPassword(req.body.email, hash, function(id, err) {

            if(!err) {
							database.getAgent(id, function(agent) {

								if(agent) {
									email.sendAgentResetEmail(agent, gen_password);

		              res.json({'success': true});
								} else {
									logger.error("Couldn't load agent object.");
		              res.json({'success': false});
								}
							});
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
