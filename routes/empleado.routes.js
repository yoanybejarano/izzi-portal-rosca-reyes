let empleados = require('../models/empleado.model');
let roles = require('../models/rol.model');
let premios = require('../models/premio.model');
let regiones = require('../models/region.model');
let {authenticate} = require('../middleware/authenticate');
let limites = require('../models/limites.model');
let fotos = require('../models/foto.model');
const _ = require('lodash');
const store = require('store');

module.exports = function (app) {
    app.route("/roscadereyes/empleado")
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

    app.route("/roscadereyes/empleado/:noEmpleado")
        .all((req, res, next) => {
            // Middleware for preexecution of routes
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/empleado/1": Find a empleado
            empleados.findByNoEmpleado(req, res);
        });

    app.route("/roscadereyes/empleado/datos/:id")
        .all((req, res, next) => {
            // Middleware for preexecution of routes
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/empleado/1": Find a empleado
            empleados.findById(req, res);
        });

    app.route("/roscadereyes/login")
        .all((req, res, next) => {
            // Middleware for preexecution of routes
            delete req.body.id;
            next();
        })
        .post(async (req, res) => {
            // "/empleado/1": Find a empleado

            const datosArchivosEvento = await fotos.listaDatosArchivosEvento();
            const datosArchivosPerfiles = await fotos.listaDatosArchivosPerfiles();
            const empleadosPerfiles = await empleados.datosEmpleadosById(datosArchivosPerfiles);
            const empleadosPerfil = _.map(empleadosPerfiles, 'nombre');
            const limite = await limites.datosLimiteByNombre('Seleccionados');
            req.body.datosArchivosEvento = datosArchivosEvento;
            req.body.empleadosPerfil = empleadosPerfil;
            req.body.limitesSeleccion = limite;
            req.body.regiones = await regiones.datosRegiones();
            empleados.login(req, res);
        });

    app.route("/roscadereyes/logout")
        .all((req, res, next) => {
            // Middleware for preexecution of routes
            delete req.body.id;
            next();
        })
        .post((req, res) => {
            // "/empleado/1": Find a empleado
            empleados.logout(req, res);
        });

    app.route("/roscadereyes/seleccionados")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get(async (req, res) => {
            // "/empleado": List Empleado
            empleados.listSelectedEmployees(req, res);
        });

    app.route("/roscadereyes/premiados")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/empleado": List Empleado
            empleados.listWinnersEmployees(req, res);
        });

    app.route("/roscadereyes/admin")
        .all(authenticate, (req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get(async (req, res) => {
            const datosArchivosEvento = await fotos.listaDatosArchivosEvento();
            const datosArchivosPerfiles = await fotos.listaDatosArchivosPerfiles();
            const empleadosPerfiles = await empleados.datosEmpleadosById(datosArchivosPerfiles);
            const empleadosPerfil = _.map(empleadosPerfiles, 'nombre');
            const token = store.get('x-auth');
            const empleadoResult = await empleados.findByTokenCode(token);
            const regionUsuario = [empleadoResult.region];
            var scripts = [
                {script: 'https://momentjs.com/downloads/moment-with-locales.js'},
                {script: '/rosca/assets/js/client.js'}
            ];
            const limite = await limites.datosLimiteByNombre('Seleccionados');
            const cantidadSeleccionados = await empleados.countSelectedEmployeesByRegion(empleadoResult.region._id);
            const regionesDisponibles = await regiones.datosRegiones();
            res.render('admin', {
                evento: datosArchivosEvento,
                perfiles: empleadosPerfil,
                regionesDisponibles: regionesDisponibles,
                scripts: scripts,
                rol: empleadoResult.rol.nombre,
                seleccionados: cantidadSeleccionados,
                limitesSeleccion: limite
            });
            // empleados.loadAdmin(req, res);
        });

    app.route("/roscadereyes/cambio_estatus")
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

    app.route("/roscadereyes/empleado/region/:idRegion")
        .all((req, res, next) => {
            // Middleware for preexecution of routes
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/empleado/1": Find a empleado
            empleados.findByRegion(req, res);
        });

    app.route("/roscadereyes/empleado/cambiarRol")
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

    app.route("/roscadereyes/empleado/:id/premio/:idPremio")
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

    app.route("/roscadereyes/empleadoids/:regionId")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/empleado": List Empleado
            empleados.listEmpleadosIds(req, res);
        });

    app.route("/roscadereyes/empleado/:noEmpleado/region/:idregion")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get(async (req, res) => {
            // "/premios": List premios
            empleados.findByNoEmpleadoAndRegion(req, res);
        });

    app.route("/roscadereyes/empleado/localidades/:regionId")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get((req, res) => {
            // "/empleado": List Empleado
            empleados.listaLocalidadesPorRegion(req, res);
        });


};