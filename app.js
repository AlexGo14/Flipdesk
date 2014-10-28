var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
nconf = require('nconf');
pg = require("pg");

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
	},
	debug: true
});

/*var databaseObj = nconf.get('database');
conString = "pg://" + databaseObj.user + ":" + databaseObj.password + "@" + 
		databaseObj.ip + ":" + databaseObj.port + "/" + databaseObj.name;

console.log('Try to connect to database ...');
pg.connect(conString, function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  } else {
	  console.log('Database connection established.');
  }
});*/


var landing_page = require('./routes/index');
var tickets = require('./routes/tickets');
var administration = require('./routes/administration');
var password_reset = require('./routes/password-reset');

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

app.use('/', landing_page);
app.use('/tickets', tickets);
app.use('/administration', administration);
app.use('/password-reset', password_reset);


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
