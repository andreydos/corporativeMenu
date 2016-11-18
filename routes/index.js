var wLogger = require('../helpers/wlogger-json')(__filename);
var express = require('express');
var router = express.Router();
var config = require('../config');


/* GET home page. */
router.get('/', function (req, res, next) {
	wLogger.req.info(req, 'Успешный переход на стартовую страницу');
    res.render('index');
});

module.exports = router;
