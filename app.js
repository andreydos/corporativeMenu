var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var config = require('./config');
var wLogger = require('./helpers/wlogger-json')(__filename);

const serviceAccount = require('./data/database');

var routes = require('./routes/index');

var https = require('https');

var app = express();

var firebaseAdmin = require("firebase-admin");
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: "https://test-base-cfbe6.firebaseio.com"
});

var database = firebaseAdmin.database();

var server = https.createServer(app);
var io = require('socket.io').listen(server);
server.listen(3001);
io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
});

io.on('connection', function (socket) {
    socket.on('save order to db', function (data) {
        if ( !data.date || !data.currentOrder || !data.user) return;
        wLogger.info('Save order of user: ', data.user);
        database.ref('orders/' + data.date + '/' + data.user).set(data.currentOrder);
    });
});


wLogger.info('Путь к проекту', __dirname);


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


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
