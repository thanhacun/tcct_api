var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
//var session = require('express-session');

// setting public variables - process.env.VAR_NAME
require('dotenv').config()

var users = require('./routes/users');
const tcct = require('./routes/tcct');

var app = express();

// ==========================
// MONGODB =================
// ==========================
mongoose.connect(process.env.MONGODB_URI, {
  // options
  useMongoClient: true
});
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err}`);
  process.exit(1);
})

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

//make json response pettier
app.set('json spaces', 2);

// uncomment after placing your favicon in /public
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


//enable CORS in express
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

/* PASSPORT */
// NOTE: jwt does not require session
require('./config/passport')(passport);
//app.use(session({ secret: 'my api server' }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/users', users);
app.use('/api/tcct', tcct);

//production mode and for SPA (client-render)
app.use(express.static(path.join(__dirname, 'build')));
app.get('/*', function(req, res){
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// catch 404 and forward to error handler
// NOTE: this is how 404 error is handled by using last middleware
// just before the errors handle middleware
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
