require('./config/env');

const express = require('express');
const bodyParser = require('body-parser');
const consign = require('consign');
const logger = require('./config/logger');
const gallery = require('./config/slider');
const morgan = require('morgan');
const winMid = require("express-winston-middleware");

let app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Rosca Reyes izzi - Port ${port}`);
});



app.use(morgan(function (tokens, req, res) {
    return [
        tokens.date(req, res),
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        tokens['response-time'](req, res), 'ms'
    ].join(' ')
}, logger.morganOptions));

app.use('/roscadereyes/slider', gallery);

consign()
    .include("config/database.js")
    .then("models")
    .then("routes")
    .into(app);

let configView = require('./config/views');
app = configView(app);

module.exports = {app};