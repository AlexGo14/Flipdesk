var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
session = require('cookie-session')
var bodyParser = require('body-parser');
nconf = require('nconf');
pg = require("pg");
passport = require("passport");
PassportLocalStrategy = require('passport-local').Strategy;
bcrypt = require('bcrypt');
moment = require("moment-timezone");
var utility = require("./routes/utility");
var fs = require('fs');

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


//Configure nconf
nconf.argv()
     .env()
     .file({ file: 'config.json' });


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

//Checks if a connection to database can be established.
utility.checkDatabaseConnection(function(status) {
	if(!status) {
		logger.error("Aborting server now!");
		process.exit(1);
	}
})

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
			return done(null, false, {message: "The user does not exist"});
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

				var userObj = utility.setAgentObject(rows[i]);

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
	utility.getAgent(id, function(agent) {
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
