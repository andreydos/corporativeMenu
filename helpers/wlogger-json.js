/**
 * Оболочка над логгированием, используя утилиту winston
 * 1) Добавляет цвет в консоль
 * 2) При выводе сообщения, добавляет название файла в начало сообщения
 * 3) При выводе в файл, создает его при необходимости и в начало строки добавляет временную метку
 * 4) Добавлен специальный статус "nothing", который отключает логгирование
 *
 *
 * Each level is given a specific integer priority.
 * The higher the priority the more important the message is considered to be,
 * and the lower the corresponding integer priority.
 * For example, npm logging levels are prioritized from 0 to 5 (highest to lowest):
 * { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
 *
 * Similarly, as specified exactly in RFC5424 the syslog levels are prioritized
 * from 0 to 7 (highest to lowest).
 * { emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7 }
 *
 * https://github.com/winstonjs/winston
 */
var config = require('../config'),
    winston = require('winston'),
    winstonConfig = require('winston/lib/winston/config'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    appDir = path.dirname(require.main.filename);

/**
 * Получаем путь к корню проекта
 */
appDir = appDir.replace('\\bin', '').replace('/bin', '');

/**
 * Проверяем путь для сохранения логов и при необходимости создаём его
 */
fs.access(
    config.logs.path,
    function (accessError) {
        if (accessError) {
            mkdirp(config.logs.path, '0755', function (createError) {
                if (createError) {
                    console.error('=====ERROR: Create dir for logs (' + config.logs.path + ')');
                    console.error(createError);
                }
            })
        }
    }
);

var formatter = function (options) {
    var _result = {
        date: new Date().toString(),
        level: options.level.toUpperCase(),
        message: (typeof options.message === 'undefined' ? '' : options.message),
        meta: options.meta.meta,
        __modulePath: options.meta.__modulePath,
        __url: options.meta.__url
    };

    return JSON.stringify(_result);
};

var consoleSimpleFormatter = function (options) {
    return winstonConfig.colorize(options.level) + ":\t" + options.message;
};

var processArguments = function (_arguments, relativeModuleName) {
    /**
     * Проверяем - задан ли последним или предпоследним параметром объект-мета-информация
     * Согласно примерам на странице https://github.com/winstonjs/winston
     */
    var indexWithObject = false;

    /**
     * Последним задан объект
     */
    if (typeof _arguments[_arguments.length-1] === 'object') {
        indexWithObject = _arguments.length-1;
    }

    /**
     * Последним задана callback-функция
     * Предпоследним - объект
     */
    if (typeof _arguments[_arguments.length-2] === 'object' &&
        typeof _arguments[_arguments.length-1] === 'function') {
        indexWithObject = _arguments.length-2;
    }

    /**
     * Объект для вывода в meta существует
     * Добавляем в объект дополнительные данные
     */
    if (indexWithObject !== false) {
        _arguments[indexWithObject].__modulePath = relativeModuleName;
        _arguments[indexWithObject].__url = '';
    } else {
        /**
         * Добавляем в аргументы новый элемент-объект для попадания в meta-данные
         */
        Array.prototype.push.call(_arguments, {
            __modulePath: relativeModuleName,
            __url: ''
        });
    }

    return _arguments;
};

var processArgumentsWithRequest = function (_arguments, relativeModuleName) {
    var requestObject = _arguments[0],
        url = requestObject.originalUrl;

    /**
     * Удаляем первый аргумент с объектом Request
     */
    Array.prototype.shift.apply(_arguments);

    /**
     * Проверяем - задан ли последним или предпоследним параметром объект-мета-информация
     * Согласно примерам на странице https://github.com/winstonjs/winston
     */
    var indexWithObject = false;

    /**
     * Последним задан объект
     */
    if (typeof _arguments[_arguments.length-1] === 'object') {
        indexWithObject = _arguments.length-1;
    }

    /**
     * Последним задана callback-функция
     * Предпоследним - объект
     */
    if (typeof _arguments[_arguments.length-2] === 'object' &&
        typeof _arguments[_arguments.length-1] === 'function') {
        indexWithObject = _arguments.length-2;
    }

    /**
     * Объект для вывода в meta существует
     * Добавляем в объект дополнительные данные
     */
    if (indexWithObject !== false) {
        _arguments[indexWithObject].__modulePath = relativeModuleName;
        _arguments[indexWithObject].__url = url;
    } else {
        /**
         * Добавляем в аргументы новый элемент-объект для попадания в meta-данные
         */
        Array.prototype.push.call(_arguments, {
            __modulePath: relativeModuleName,
            __url: url
        });
    }

    return _arguments;
};

var wLogger = new (winston.Logger)({
        transports: [
            // colorize the output to the console
            new (winston.transports.Console)({
                colorize: true,
                formatter: consoleSimpleFormatter
            }),
            new (winston.transports.File)({
                name: 'info-file',
                json: false,
                level: 'info',
                filename: config.logs.path + config.runMode + '-info.log'
                ,formatter: formatter
            }),
            new (winston.transports.File)({
                name: 'warn-file',
                json: false,
                level: 'warn',
                filename: config.logs.path + config.runMode + '-warn.log'
                ,formatter: formatter
            }),
            new (winston.transports.File)({
                name: 'error-file',
                json: false,
                level: 'error',
                filename: config.logs.path + config.runMode + '-error.log'
                ,formatter: formatter
            }),
            new (winston.transports.File)({
                name: 'debug-file',
                json: false,
                level: 'debug',
                filename: config.logs.path + config.runMode + '-debug.log'
                ,formatter: formatter
            })
        ]
    });

    wLogger.level = config.logs.level;

    wLogger.rewriters.push(function(level, msg, meta) {
        var __modulePath = meta.__modulePath,
            __url = meta.__url;

        delete meta.__modulePath;
        delete meta.__url;

        return {
            meta: meta,
            __modulePath: __modulePath,
            __url: __url
        }
    });

    if (wLogger.level === 'nothing') {
        wLogger.clear();
    }

module.exports = function (moduleName) {
    var relativeModuleName = moduleName.replace(appDir, ''),
        url = '';

    return {
        nativeLogger: wLogger,

        error: function () {
            wLogger.error.apply(this, processArguments(arguments, relativeModuleName));
        },
        warn: function () {
            wLogger.warn.apply(this, processArguments(arguments, relativeModuleName));
        },
        info: function () {
            wLogger.info.apply(this, processArguments(arguments, relativeModuleName));
        },
        verbose: function () {
            wLogger.verbose.apply(this, processArguments(arguments, relativeModuleName));
        },
        debug: function () {
            wLogger.debug.apply(this, processArguments(arguments, relativeModuleName));
        },
        silly: function () {
            wLogger.silly.apply(this, processArguments(arguments, relativeModuleName));
        },
        add: function () {
            wLogger.add(arguments)
        },
        remove: function () {
            wLogger.remove(arguments)
        },
        profile: function () {
            wLogger.profile(arguments)
        },
        query: function () {
            wLogger.query(arguments)
        },
        stream: function () {
            wLogger.stream(arguments)
        },
        clear: function () {
            wLogger.clear();
        },

        req: {
            /**
             * Первым параметром передаём объект Request,
             * дальше - все остальные параметры
             */
            error: function () {
                wLogger.error.apply(this, processArgumentsWithRequest(arguments, relativeModuleName));
            },
            warn: function () {
                wLogger.warn.apply(this, processArgumentsWithRequest(arguments, relativeModuleName));
            },
            info: function () {
                wLogger.info.apply(this, processArgumentsWithRequest(arguments, relativeModuleName));
            },
            verbose: function () {
                wLogger.verbose.apply(this, processArgumentsWithRequest(arguments, relativeModuleName));
            },
            debug: function () {
                wLogger.debug.apply(this, processArgumentsWithRequest(arguments, relativeModuleName));
            },
            silly: function () {
                wLogger.silly.apply(this, processArgumentsWithRequest(arguments, relativeModuleName));
            }
        }
    }
};