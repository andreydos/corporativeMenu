var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var config = require('./config');
var wLogger = require('./helpers/wlogger-json')(__filename);

var routes = require('./routes/index');

var app = express();

wLogger.info('Путь к проекту', __dirname);


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.use(express.static(path.join(__dirname, 'public')));

wLogger.info('Путь к public', path.join(__dirname, 'public'));

app.use('/', routes);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
app.use(function (err, req, res, next) {
    /**
     * For development mode
     */
    if (config.runMode === 'development') {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    } else {
        /**
         * For production and others mode
         */
        if (err.status == 404) {
            res.redirect('/404');
        } else {
            res.redirect('/500');
        }
    }
});


module.exports = app;