var regiones = require('../models/region.model');

module.exports = function (app) {
    app.route("/regiones")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/regiones": List regiones
            regiones.list(req, res);
        });

    app.route("/regiones/:id")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/regiones": List regiones
            regiones.findById(req, res);
        });
};