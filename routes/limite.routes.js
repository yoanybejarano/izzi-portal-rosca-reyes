var limites = require('../models/limites.model');

module.exports = function (app) {
    app.route("/limites")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/limites": List limites
            limites.list(req, res);
        });

    app.route("/limites/:id")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/limites": List limites
            limites.findById(req, res);
        });

    app.route("/limites/modificar_seleccionados")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .post((req, res) => {
            // "/limites": List limites
            limites.modificarCantidadSeleccionados(req, res);
        });

    app.route("/limites/key/:keyName")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/limites": List limites
            limites.limiteByNombre(req, res);
        });
};