const morgan = require('morgan');
const fs = require('fs');

// var accessLogStream = fs.createWriteStream(__dirname + '/logs/' + "access.log", {flags: 'a'});
morganOptions = {
    skip: function (req, res) {
        let url = req.protocol + "://" + req.get('host') + req.originalUrl;
        let assets = url.includes('/fonts') ||
            url.includes('/js') ||
            url.includes('/css') ||
            url.includes('/img') ||
            url.includes('/video') ||
            url.includes('/scss');
        return assets;
    }
};

let logger = morgan('dev', morganOptions);

module.exports = logger;