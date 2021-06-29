var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var createError = require('http-errors')
var bodyParser = require('body-parser')
require('dotenv').config()
const { connect } = require('./db/connection')
const authenticate = require('./auth/auth')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var reservationRouter = require('./routes/reservations')

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', indexRouter);
app.use('/users', authenticate, usersRouter);
app.use('/reservations', authenticate, reservationRouter)

connect()

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
  
app.set('port', process.env.PORT || 3000)
app.listen(app.get('port'), () => {
  console.log(`Express server listening on port ${app.get('port')}`)
})

