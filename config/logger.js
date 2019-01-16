const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const appRoot = require('app-root-path');
const winston = require('winston');

//================ Winston ===========================================================/

winston.emitError = true;

const options = {
    fileInfo: {
        level: 'info',
        filename: `${appRoot}/logs/app.log`,
        handleExceptions: true,
        humanReadableUnhandledException: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    fileError: {
        level: 'error',
        filename: `${appRoot}/logs/exceptions.log`,
        handleExceptions: true,
        humanReadableUnhandledException: true,
        json: true,
        timestamp: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

const logger = winston.createLogger({
    transports: [
        new winston.transports.File(options.fileInfo),
        new winston.transports.Console()
    ],
    exceptionHandlers : [
        new winston.transports.File({filename: `${appRoot}/logs/exceptions.log`})
    ],
    exitOnError: false
});


logger.morganOptions = {
    skip: function (req, res) {
        let url = req.protocol + "://" + req.get('host') + req.originalUrl;
        let assets = url.includes('/fonts') ||
            url.includes('/js') ||
            url.includes('/css') ||
            url.includes('/img') ||
            url.includes('/video') ||
            url.includes('/scss') ||
            url.includes('/uploads');
        return assets;
    },
    stream: {
        write: function (message, encoding) {
            logger.info(message);
        }
    }
};

module.exports = logger;


//================ Morgan ===========================================================/
// var accessLogStream = fs.createWriteStream(appRoot + '/logs/app.log', { flags: 'a' });
// morganOptions = {
//     skip: function (req, res) {
//         let url = req.protocol + "://" + req.get('host') + req.originalUrl;
//         let assets = url.includes('/fonts') ||
//             url.includes('/js') ||
//             url.includes('/css') ||
//             url.includes('/img') ||
//             url.includes('/video') ||
//             url.includes('/scss') ||
//             url.includes('/uploads');
//         return assets;
//     },
//     stream: accessLogStream
// };
//
// let logger = morgan(function (tokens, req, res) {
//     return [
//         tokens.date(req, res),
//         tokens.method(req, res),
//         tokens.url(req, res),
//         tokens.status(req, res),
//         tokens.res(req, res, 'content-length'),
//         tokens['response-time'](req, res), 'ms'
//     ].join(' ')
// }, morganOptions);
//
// module.exports = logger;