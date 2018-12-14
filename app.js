require('./config/env');

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const consign = require('consign');

let app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Rosca Reyes izzi - Port ${port}`);
});

consign()
    .include("config/database.js")
    .then("models")
    .then("routes")
    .into(app);