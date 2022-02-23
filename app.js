var createError = require('http-errors');
var express = require('express');
const expressLayouts = require('express-ejs-layouts');

var path = require('path');
var cookieParser = require('cookie-parser');
const expressSession = require('express-session');
var logger = require('morgan');

var athleteRouter = require('./routes/athletes');
var indexRouter = require('./routes/index');
var eventRouter = require('./routes/events');
var usersRouter = require('./routes/users');

var app = express();
const {sequelizeSessionStore} = require('./sequelize')
const conf = require('./config');

// view engine setup
app.use(expressLayouts)
app.set('layout', './layouts/full-width')
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({
  secret : conf.sessionSecret,
  store: sequelizeSessionStore,
  resave: false,
  saveUninitialized: false,
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/locationpicker', express.static(__dirname + '/node_modules/leaflet-locationpicker/dist/'));
app.use('/flagpack', express.static(__dirname + '/node_modules/flagpack/dist/'));
app.use('/flags', express.static(__dirname + '/node_modules/flagpack/flags/'));

app.use('/', indexRouter);
app.use('/events', eventRouter);
app.use('/users', usersRouter);
app.use('/athletes', athleteRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

var formLogger = function(error, req, res, next) {
  if (error.type === 'form') {
    req.session.errors = error.errors;
    req.session.form = req.body;
    res.redirect(error.landPage);
  }
  next(error);
};

// error handler
app.use(formLogger);
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.locals.activeLink = function(page, pageName) {
  if (page && (page === pageName)) {
    return ' active';
  }
}

app.locals.fieldError = function(field, errors) {
  if (!errors) {
    return '';
  }
  return (errors.field == field) ? 'is-invalid' : 'is-valid';
}

app.locals.errorDescription = function(field, errors) {
  if (errors.field == field) {
    var description = "<ul>";
    for (var i = 0; i < errors['messages'].length; i++) {
        description = description + "<li>" + errors['messages'][i] + "</li>";
    }
    description = description + "</ul>";
    return description;
  } else {
    return '';
  }
}

app.locals.findMimeIcon = function(mimeType) {
  // List of official MIME Types: http://www.iana.org/assignments/media-types/media-types.xhtml
  var icon_classes = {
    // Media
    image: "fa-file-image-o",
    audio: "fa-file-audio-o",
    video: "fa-file-video-o",
    // Documents
    "application/pdf": "fa-file-pdf",
    "application/msword": "fa-file-word",
    "application/vnd.ms-word": "fa-file-word",
    "application/vnd.oasis.opendocument.text": "fa-file-word",
    "application/vnd.openxmlformats-officedocument.wordprocessingml":
        "fa-file-word",
    "application/vnd.ms-excel": "fa-file-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml":
        "fa-file-excel",
    "application/vnd.oasis.opendocument.spreadsheet": "fa-file-excel",
    "application/vnd.ms-powerpoint": "fa-file-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml":
        "fa-file-powerpoint",
    "application/vnd.oasis.opendocument.presentation": "fa-file-powerpoint",
    "text/plain": "fa-file-text",
    "text/html": "fa-file-code",
    "application/json": "fa-file-code",
    // Archives
    "application/gzip": "fa-file-archive",
    "application/zip": "fa-file-archive"
  };

  for (var key in icon_classes) {
    if (icon_classes.hasOwnProperty(key)) {
      if (mimeType.search(key) === 0) {
        // Found it
        return icon_classes[key];
      }
    } else {
      return "fa-file";
    }
  }
}


app.locals.sizeToKo = function(size) {
  return (size/1000) + ' Ko';
}

app.locals.checkSelectedNoCase = function(input, search) {
  return (input.toLowerCase() == search.toLowerCase()) ? 'selected' : '';
}

app.locals.formatCodeOption = function(codes, country) {
  let output = ""
  for (code in codes) {
      output += '<option value="'+ code +'"';
      if (code.toLowerCase() == country.toLowerCase()) {
        output += ' selected>';
      } else {
        output += '>';
      }
      output += codes[code].toUpperCase() + "</option>";
  }
  return output;
}

  module.exports = app;