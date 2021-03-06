var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs= require('fs');
var Websocket=require('./websocket/server').websocketServer;
websocket=new Websocket()

var index = require('./routes/index');
var users = require('./routes/users');
var db = require('./routes/db');
var docker = require('./routes/docker');
var other = require('./routes/other');
var viewers = require('./routes/viewers');
var stats = require('./routes/stats');
var de = require('./routes/differential_expression')
var forms = require('./routes/forms')
var auth = require('./routes/auth')
var miRPursuit = require('./routes/mirpursuit')
var metadata = require('./routes/metadata')


// redirect stdout / stderr
if (process.env.mode=="PRODUCTION") process.__defineGetter__('stdout', function() { return fs.createWriteStream('/var/log/sRNAServer.log', {flags:'a'}) })

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//Loggin for production 
if (process.env.mode=="PRODUCTION") process.env.logger="combined"

app.use(logger(process.env.logger || 'dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', index);
app.use('/metadata', metadata);
app.use('/users', users);
app.use('/db/api/v1',db);
app.use('/vm/api/v1',docker);
app.use('/viewers',viewers);
app.use('/stats',stats);
app.use('/de',de);
app.use('/forms',forms);
app.use('/auth', auth);
app.use('/miRPursuit', miRPursuit);
app.use('/', other);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
