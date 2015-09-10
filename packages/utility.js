var nconf = require('nconf');

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
	}
}

nconf = utility.configureNconf();
module.exports = utility;
