require('./config/env');

const express = require('express');
const bodyParser = require('body-parser');
const consign = require('consign');
const logger = require('./config/logger');

let app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Rosca Reyes izzi - Port ${port}`);
});

app.use(logger);

consign()
    .include("config/database.js")
    .then("models")
    .then("routes")
    .into(app);

let configView = require('./config/views');
app = configView(app);