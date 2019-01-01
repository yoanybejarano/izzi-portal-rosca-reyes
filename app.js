require('./config/env');

const express = require('express');
const bodyParser = require('body-parser');
const consign = require('consign');
const logger = require('./config/logger');
const gallery = require('./config/slider');

let app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Rosca Reyes izzi - Port ${port}`);
});

app.use(logger);
app.use('/slider', gallery);

consign()
    .include("config/database.js")
    .then("models")
    .then("routes")
    .into(app);

let configView = require('./config/views');
app = configView(app);