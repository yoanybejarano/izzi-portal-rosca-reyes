let empleados = require('../models/empleado.model');
let roles = require('../models/rol.model');
let premios = require('../models/premio.model');
let {authenticate} = require('../middleware/authenticate');
let limites = require('../models/limites.model');

module.exports = function (app) {
    app.route("/empleado")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/empleado": List Empleado
            empleados.list(req, res);
        })
        .post((req, res) => {
            // "/empleado": Create new empleado
            empleados.create(req, res);
        });

    app.route("/empleado/:noEmpleado")
        .all((req, res, next) => {
            // Middleware for preexecution of routes
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/empleado/1": Find a empleado
            empleados.findByNoEmpleado(req, res);
        });

    app.route("/empleado/datos/:id")
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
        .post((req, res, next) => {
            // "/empleado/1": Find a empleado

            empleados.login(req, res, next);
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
        .get(async (req, res) => {
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

    app.route("/admin")
        .all(authenticate, (req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get(async (req, res, next) => {
            // "/empleado": List Empleado
            let datos = await empleados.datosEmpleados();
            res.render('admin', {empleados: datos});
        });

    app.route("/cambio_estatus")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .post(async (req, res) => {
            // "/empleado": List Empleado
            const seleccionadosPermitidos = await limites.datosLimiteByNombre('Seleccionados');
            const cantSeleccionados = await empleados.countSelectedEmployeesByRegion(req.body.filtroRegiones);
            const permitidos = seleccionadosPermitidos.value;
            if (cantSeleccionados < permitidos) {
                empleados.cambiarEmpleadoStatus(req, res);
            }
            return res.status(200).send({'message': 'La cantidad de empleados seleccionados en esta region estan ocupados'});
        });

    app.route("/empleado/region/:idRegion")
        .all((req, res, next) => {
            // Middleware for preexecution of routes
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/empleado/1": Find a empleado
            empleados.findByRegion(req, res);
        });

    app.route("/empleado/cambiarRol")
        .all((req, res, next) => {
            // Middleware for preexecution of routes
            delete req.body.id;
            next();
        })
        .post(async (req, res) => {
            // "/empleado/1": Find a empleado
            const rol = await roles.datosRolByNombre('Encargado');
            req.rol = rol;
            empleados.cambiarRol(req, res);
        });

    app.route("/empleado/:id/premio/:idPremio")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .post(async (req, res) => {
            // "/premios": List premios
            const premio = await premios.datosPremioById(req.params.idPremio);
            const empleado = await empleados.asignarPremio(req.params.id, premio);
            if (empleado.premio) {
                premios.decrementarDisponibilidad(req, res);
            }
        });

};