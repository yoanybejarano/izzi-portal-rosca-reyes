var exphbs = require('express-handlebars'),
    path = require('path'),
    moment = require('moment'),
    express = require('express'),
    routes = require('../routes/'),
    /*
    Parse incoming request bodies in a middleware before your handlers,
    available under the req.body property.
    */
    bodyParser = require('body-parser'),

    //This allows cookies to be sent and received.
    cookieParser = require('cookie-parser'),

    /**
     For older browsers that don't properly support REST
     HTTP verbs, such as UPDATE and PUT , the methodOverride middleware
     allows this to be faked using a special hidden input field.
     */
    methodOverride = require('method-override'),

    //This handles any errors that occur throughout the entire middleware process.
    errorHandler = require('errorhandler');

morgan = require('morgan');

module.exports = function (app) {

    routes(app);

    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(cookieParser('some-secret-value-here'));
    routes(app);

    if ('development' === app.get('env')) {
        app.use(errorHandler());
    }

    //Register Handlebars as default view rendering engine
    app.engine('.hbs', exphbs.create({
        defaultLayout: 'main',
        layoutsDir: app.get('views') + '/layouts',
        partialsDir: [app.get('views') + '/partials'],
        helpers: require('../helpers/handlebars').helpers,
        extname: '.hbs'
    }).engine);
    app.set('view engine', '.hbs');

    var viewsPath = path.join(__dirname, '../views/');
    console.log('views : ' + viewsPath);
    app.set('views', viewsPath);

    var staticFilesPath = path.join(__dirname, '../views/');
    console.log('static files : ' + staticFilesPath);
    app.use(express.static(staticFilesPath));
    app.use(morgan('short'));

    return app;
};