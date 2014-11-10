module.exports = {
	requireAuthentication: function (req, res, next){
		// check if the user is logged in
		if(!req.isAuthenticated()){
			req.session.messages = "You need to login to view this page";
			res.redirect('/');
		}
		next();
	},
	sendWelcomeEmail: function (firstname, lastname, email, password) {
		
		return true;
	}
}
