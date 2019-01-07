var limites = require('../models/limites.model');

module.exports = function (app) {
    app.route("/roscadereyes/limites")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/limites": List limites
            limites.list(req, res);
        });

    app.route("/roscadereyes/limites/:id")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/limites": List limites
            limites.findById(req, res);
        });

    app.route("/roscadereyes/limites/modificar_seleccionados")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .post((req, res) => {
            // "/limites": List limites
            limites.modificarCantidadSeleccionados(req, res);
        });

    app.route("/roscadereyes/limites/key/:keyName")
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