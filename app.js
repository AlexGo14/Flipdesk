var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
session = require('cookie-session')
var bodyParser = require('body-parser');
nconf = require('nconf');
pg = require("pg");
passport = require("passport");
PassportLocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var mailFunction = require('./routes/mail');
var CronJob = require('cron').CronJob;
var moment = require("moment-timezone");



nconf.argv()
       .env()
       .file({ file: 'config.json' });
       
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

var landing_page = require('./routes/index');
var tickets = require('./routes/tickets');
var administration = require('./routes/administration');
var password_reset = require('./routes/password-reset');
var authentication = require('./routes/authentication');
var statistics = require('./routes/statistics');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
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
	/* get the email and password from the input arguments of the function */
	
	// query the user from the database
	knex('agent').select().where({
		'email': email
	}).then(function(rows) {
		
		
		if(rows.length < 1) {
			// if the user does not exist
			return done(null, false, {message: "The user does not exist"});
		}
		
		console.log(rows);
		
		for( var i = 0; i < rows.length; i++) {
			console.log(i + ' - ' + rows[i].password);
			
			//Compare input password with stored password
			if(bcrypt.compareSync(password, rows[i].password)) {
				
				// if everything is OK, return null as the error
				// and the authenticated user
				knex('user').where('id', '=', rows[i].id)
				.update({
					update_timestamp: moment().format()
				})
				.then(function(rows) {
					
				})
				.catch(function(err) {
					console.log(err);
				});
				
				return done(null, rows[i] );
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
	knex('user').select().where({
		'id': id
	}).then(function(user){
		done(null, user);
	}).catch(function(err){
		done(new Error('User ' + id + ' does not exist'));
	});
});



//Mail-Listener
var job = new CronJob('* 5 * * * *', function(){
		console.log('started');
		mailFunction.start();
	}, function () {
		console.log('Error occurred: stopped imap service');
	},
	true
);


app.use('/', landing_page);
app.use('/tickets', tickets);
app.use('/administration', administration);
app.use('/password-reset', password_reset);
app.use('/authentication', authentication);
app.use('/statistics', statistics);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

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
    console.log('Listening on port %d', server.address().port);
});
