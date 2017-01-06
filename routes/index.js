var wLogger = require('../helpers/wlogger-json')(__filename);
var express = require('express');
var router = express.Router();
var config = require('../config');


router.get('/', function (req, res, next) {
    res.render('login');
    wLogger.req.info(req, 'Переход на стартовую страницу');
});

router.get('/home', function (req, res, next) {
    console.log('req.query.u: ', req.query.u);

    res.render('index');
    wLogger.req.info(req, 'Переход на домашнюю страницу');
});

module.exports = router;
