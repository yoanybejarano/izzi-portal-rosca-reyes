var roles = require('../models/rol.model');

module.exports = function (app) {
    app.route("/roles")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/roles": List roles
            roles.list(req, res);
        });

    app.route("/roles/:id")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/roles": List roles
            roles.findById(req, res);
        });
};