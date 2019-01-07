var premios = require('../models/premio.model');
var empleados = require('../models/empleado.model');

module.exports = function (app) {
    app.route("/roscadereyes/premios")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/premios": List premios
            premios.list(req, res);
        });

    app.route("/roscadereyes/premios/:id")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/premios": List premios
            premios.findById(req, res);
        });

    app.route("/roscadereyes/premios/empleado/:noEmpleado")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/premios": List premios
            premios.findByNoEmpleado(req, res);
        });

    app.route("/roscadereyes/empleadosganadores")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/premios": List premios
            premios.listEmpleadosGanadores(req, res);
        });

    app.route("/roscadereyes/premiosdisponilbles")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/premios": List premios
            premios.premiosDisponibles(req, res);
        });

};


