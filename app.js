var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var config = require('./config');
var wLogger = require('./helpers/wlogger-json')(__filename);

var routes = require('./routes/index');

var http = require('http');

var app = express();

var firebaseAdmin = require("firebase-admin");
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
        "type": "service_account",
        "project_id": "test-base-cfbe6",
        "private_key_id": "2932a305ae8799440e14186bbc2632fc9cdc9536",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC9HlM+8NlNnHam\nWpOp3Kh7d+beHSPCzel5BWmtWcBq4HN/CTBbgPXjPxmtSTIQQDFZpr5yRszIxCtV\nj5AArRAs9ea2tclM+XCVbqKNo9EvbRWWKspYtVVD82Eas48SoTSgH7KvqT8EwmQ4\ntKvmKKQiiwqpdW6EG4kLDeV93DuD/55ZdLreI14480IQRIuKCyrkfc26OW9LlVBI\n2Ptdks+wfbspl3E2NqxR5og/nWpTvbPukfIT1OJymTqOiz9bBEVqNVKzfxps/uZm\nkmOJZgqn4yZufAA3NGtbgBDMjgorYc6c2oThuCzmK80WvWh5+BoiMGf6+oMFJYfO\naoZ5Duj1AgMBAAECggEAds8aVSxSGCP3lkLJCamKXybQbzG3Saa6ykDQRwtfisU/\nScuoCZRW5VC6/NZDEVqCpmPOuVQpSueSocnzGbmfs9839gj2UdlTFU3P6VPFExpg\nuVpgjKI+0tWPZ4rukzGbMg034Ite/8pv1AANDibyFpFrPVJ8/5mc2sj8J7m32hAj\nmseLlaFRcCd5smDdD5K3eQQvGFRmKJkZYJYW6PCgdK19+oi9GOX+ghDaGLb98c2K\nzk2TDyQGdUPaFAyaKjwGUyTzGF47RncTyVa7IVcM72h3hM+ILfJPHQhQ3sd1bixN\naxVqhM1nWFN/cBwOU6Bwt9Lrcqgu3eMt36aRiB4OcQKBgQDp9OUVehydyGYGgMnE\nLCo934W+zSAYo95i5zlnb9sltGAfbON3h3oAlPk+aicp1eo6zJWCS4ahYTvO6S62\nPXUFAtWPvcLnh7tROVLXT1clfNvhzBEXJzIhZQTJPhDu4rsNrQuCDPlZn07c7SQI\n/qIxBk+d1iQoTAfGgX0CEBC5LwKBgQDO7+uOOm+dYwp5DjuI3MxQQefdzV3LK7xi\n/LL0qLPZmu519R559Voo0LQbvNUk54Hd4yJOn+VDOT58FiLSC5bCXIKEhlp0+WUl\nGq25fffTS5N/vtn0WEtUSdqGT/wyjZvQFlENj8choquLleRLgxpkOFVELWuSkjRw\nbSiBKQBvGwKBgAb2+mbkRrvPvnHNHbSQWAWVhObENoNlRXaOSaAxrUV3FDF7TV4+\nkzw3MyBPirDtJFbxxjWlx/E/8sbbHD/innwytGbeEFJSMRpe6X9tZjvAds9HAu88\nhHqIBldzWI+0AjuK/j+14Spw2qkrChqWcf+hn3cka9kjQkv/iNgp4EWTAoGAK4bp\nnDQMcCV5+XaV7TbMPwFt3QiqdubPLF8M4Utu8RGWoPcbHvoNqdIkYEU67BVKCrsQ\n50rYtWggDYe2cUoAvwcoaOm9sycWMFTJP+AQNcCK2O7y92NvDN6v+VpvqM6CfKWF\nDP42G4wU2zp/F6cO8Q+sV7faDa11HETJpUlTjwsCgYBDCpp+dzj/4TvXAnOEkQ71\ntP1XKzuQ1VPM6y5skEqg6TT/CAPx/mrB/wy4LNVcUV+mlkJ8Gmic+qjMFmsDi9Ln\nOs/1aoT0qxeqp7LRqi6CggYYHqRxm2+UcL6AJWCjhmSwdsxiensY/e9bkF5yYLwr\nHXd84vnY+AdxMeABMiYNvQ==\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-bhu0r@test-base-cfbe6.iam.gserviceaccount.com",
        "client_id": "110371974305702452655",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://accounts.google.com/o/oauth2/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-bhu0r%40test-base-cfbe6.iam.gserviceaccount.com"
    }),
    databaseURL: "https://test-base-cfbe6.firebaseio.com"
});

var database = firebaseAdmin.database();

var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(3001);

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
