var createError = require('http-errors');
var express = require('express');
const expressLayouts = require('express-ejs-layouts')

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var eventRouter = require('./routes/events');
var usersRouter = require('./routes/users');

var app = express();
require('./sequelize')

// view engine setup
app.use(expressLayouts)
app.set('layout', './layouts/full-width')
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/locationpicker', express.static(__dirname + '/node_modules/leaflet-locationpicker/dist/'));
app.use('/flagpack', express.static(__dirname + '/node_modules/flagpack/dist/'));
app.use('/flags', express.static(__dirname + '/node_modules/flagpack/flags/'));

app.use('/', indexRouter);
app.use('/events', eventRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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