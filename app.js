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
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var utility = require('./packages/utility');
var database = require('./packages/database');
var fs = require('fs');
var nconf = utility.configureNconf();
var objects = require('./packages/objects');
session = require('cookie-session');
pg = require("pg");
passport = require("passport");
PassportLocalStrategy = require('passport-local').Strategy;
bcrypt = require('bcrypt');
moment = require("moment-timezone");

//TODO: Muss entfernt werden
//Configure database
knex = require('knex')({
	client: nconf.get('database').type,
	connection: {
		host: nconf.get('database').ip,
		user: nconf.get('database').user,
		password: nconf.get('database').password,
		database: nconf.get('database').name
	},
	pool: {
		min: 0,
		max: 10
	}//,
	//debug: true
});

var logDir = './logs';
if(!fs.existsSync(logDir)) {
	console.log('Log directory is missing.');

	fs.mkdirSync(logDir);

	console.log('Created log directory.');
}

//Configure log4js
log4js = require("log4js");
log4js.configure({
	appenders: [
		{ type: 'console' },
		{ type: 'file', filename: 'logs/flipdesk_' + moment().format('DD-MM-YYYY') + '.log', category: 'flipdesk' }
	]
});
logger = log4js.getLogger('flipdesk');
logger.setLevel('INFO');


//Checks if a connection to database can be established.
database.checkDatabaseConnection(function(status) {
	if(!status) {
		logger.error("Aborting server now!");
		process.exit(1);
	}
});

//Get routes
var landing_page = require('./routes/index');
var tickets = require('./routes/tickets');
var administration = require('./routes/administration');
var password_reset = require('./routes/password-reset');
var authentication = require('./routes/authentication');
var statistics = require('./routes/statistics');
var pwchange = require('./routes/pwchange');


var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'SECRET' }));
app.use(passport.initialize());
app.use(passport.session());


//Authentication functions
passport.use('local', new PassportLocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
	/* gets the email and password from the input arguments of the function */

	// query the user from the database
	knex('agent').select().where({
		'email': email
	}).then(function(rows) {
		if(rows.length < 1) {
			// if the user does not exist
			return done(null, false, { message: "The user does not exist" });
		}

		for( var i = 0; i < rows.length; i++) {

			//Compare input password with stored password
			if(bcrypt.compareSync(password, rows[i].password)) {

				// if everything is OK, return null as the error
				// and the authenticated user
				knex('agent').where('id', '=', rows[i].id)
				.update({
					update_timestamp: moment().format()
				})
				.then(function(rows) {

				})
				.catch(function(err) {
					logger.error(err);
				});

				logger.warn("Test");
				var userObj = objects.setAgentObject(rows[i]);

				return done(null, userObj );
			}
		}
	}).catch(function(err){
		// if command executed with error
		return done(err);
	});
  }
));
passport.serializeUser(function(user, done) {
	done(null, user.id);
});
passport.deserializeUser(function(id, done) {
	// query the current user from database
	database.getAgent(id, function(agent) {
		if(agent != null) {
			done(null, agent);
		} else {
			done(new Error('Agent ID: ' + id + ' does not exist'));
		}
	});
});

//Set routes up
app.use('/', landing_page);
app.use('/tickets', tickets);
app.use('/administration', administration);
app.use('/password-reset', password_reset);
app.use('/authentication', authentication);
app.use('/statistics', statistics);
app.use('/pwchange', pwchange);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// ERROR HANDLERS

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = app.listen(nconf.get('server').port, function() {
	logger.info('Listening on port %d', server.address().port);
});
