
let empleados = require('../models/empleado.model');
let { authenticate } = require('../middleware/authenticate');

module.exports = function (app) {
    app.route("/empleado")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get(authenticate, (req, res) => {
            // "/empleado": List Empleado
            empleados.list(req, res);
        })
        .post((req, res) => {
            // "/empleado": Create new empleado
            empleados.create(req, res);
        });

    app.route("/empleado/:id")
        .all((req, res, next) => {
            // Middleware for preexecution of routes
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/empleado/1": Find a empleado
            empleados.findById(req, res);
        });

    app.route("/login")
        .all((req, res, next) => {
            // Middleware for preexecution of routes
            delete req.body.id;
            next();
        })
        .post((req, res) => {
            // "/empleado/1": Find a empleado
            empleados.login(req, res);
        });

    app.route("/logout")
        .all((req, res, next) => {
            // Middleware for preexecution of routes
            delete req.body.id;
            next();
        })
        .post((req, res) => {
            // "/empleado/1": Find a empleado
            empleados.logout(req, res);
        });

    app.route("/seleccionados")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/empleado": List Empleado
            empleados.listSelectedEmployees(req, res);
        });

    app.route("/premiados")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/empleado": List Empleado
            empleados.listWinnersEmployees(req, res);
        });



};