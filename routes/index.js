var wLogger = require('../helpers/wlogger-json')(__filename);
var express = require('express');
var router = express.Router();
var config = require('../config');


/* GET home page. */
router.get('/', function (req, res, next) {
	wLogger.req.info(req, 'Успешно');
    res.send('respond with a resource');
});

module.exports = router;
