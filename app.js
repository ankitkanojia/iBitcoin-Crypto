var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');



const expressValidator = require('express-validator');
var app = express();


//Authentication HERE
//NOTE: Authentication code was done in buy page only
var session = require('express-session');
var passport = require('passport');
var MySQLStore = require('express-mysql-session')(session);

var options = {
    host: 'dz8959rne9lumkkw.chr7pe7iynqr.eu-west-1.rds.amazonaws.com',
    port: 3306,
    user: 'j6lsyd2hffi0h2fn',
    password: 'lcmpe8wvzppcjv41',
    database: 'lt8rix0txswy3kn8'
};

var sessionStore = new MySQLStore(options);

app.use(session({
    secret: 'aklsmdlkasaklnqm23asd21',
    resave: false,
    store: sessionStore,
    saveUninitialized: false,
    //cookie: { secure: true } || //TRUE IF WE HAVE HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());
//END Authentication

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var registrationRouter = require('./routes/registration');
var forgotpasswordRouter = require('./routes/forgotpassword');
var buyRouter = require('./routes/buy');
var _401Router = require('./routes/401');
var orderbookRouter = require('./routes/orderbook');
var sellRouter = require('./routes/sell');
var mywalletRouter = require('./routes/mywallet');
var myprofileRouter = require('./routes/myprofile');

app.use(expressValidator());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/registration', registrationRouter);
app.use('/forgotpassword', forgotpasswordRouter);
app.use('/buy', buyRouter);
app.use('/401', _401Router);
app.use('/orderbook', orderbookRouter);
app.use('/sell', sellRouter);
app.use('/mywallet', mywalletRouter);
app.use('/myprofile', myprofileRouter);


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

//Timer function to save bitmex data
const BitmexApis = require("./routes/Helpers/BitmexApis");
setInterval(function () {
    BitmexApis.SetLiveTradeData('XBTUSD');
}, 3000);

//Timer function to save forex data
const ForexApis = require("./routes/Helpers/ForexApis");
setInterval(function () {
    ForexApis.SetForexRateData();
}, 3600000);

module.exports = app;
