var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var orgRouter = require('./routes/organisation');
var adminsRouter = require('./routes/admins');
var updatesRouter = require('./routes/updates');

var mysql = require('mysql2');
var session = require('express-session');

var dbConnectionPool = mysql.createPool({
  host: "127.0.0.1",
  //user: "root",
  database: "volunteer"
});

dbConnectionPool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Successfully connected with id ' + connection.threadId);
  connection.release();
});

var app = express();

app.use(function (req, res, next) {
  req.pool = dbConnectionPool;
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret: 'afancyquote',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(express.static(path.join(__dirname, 'public')));

// app.use(function (req, res, next) {
//   if (req.session.userid != null) console.log("The current user is:" + req.session.userid);
//   else console.log("The current organisation is:" + req.session.orgabn);
//   next();
// });

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/organisation', orgRouter);
app.use('/admins', adminsRouter);
app.use('/updates/', updatesRouter);

app.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
