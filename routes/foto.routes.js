const multer = require('multer');
const multerConfig = require('../config/fileupload');
const regiones = require('../models/region.model');
const empleados = require('../models/empleado.model');
const fotos = require('../models/foto.model');
const roles = require('../models/rol.model');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

module.exports = function (app) {
    app.route("/roscadereyes/galeria")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get(async (req, res) => {
            const datosArchivosEvento = await fotos.listaDatosArchivosEvento();
            const datosArchivosPerfiles = await fotos.listaDatosArchivosPerfiles();
            const empleadosPerfiles = await empleados.datosEmpleadosById(datosArchivosPerfiles);
            const empleadosPerfil = _.map(empleadosPerfiles, 'nombre');

            // res.render('reyes', {evento: datosArchivosEvento, perfiles: empleadosPerfil});
            res.render('reyes', {
                evento: datosArchivosEvento,
                perfiles: empleadosPerfil
            });
        })

    app.route("/roscadereyes/galeria/:id")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get(async (req, res) => {
            const datosArchivos = await fotos.listaArchivos(req, res);
        });

    app.route("/roscadereyes/upload")
        .all((req, res, next) => {
            // Middleware for preexecution of routes
            delete req.body.id;
            next();
        })
        .post(multer(multerConfig).single('photo'), async (req, res) => {
            const regionObject = await regiones.datosRegionById(req.body.filtroRegionFotoEvento);
            req.body.regionObject = regionObject;
            fotos.salvarFoto(req, res);
        });

    app.route("/roscadereyes/empleado/seleccionar/")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .post(multer(multerConfig).single('photo'), async (req, res) => {
            // const regionObject = await regiones.datosRegionById(req.body.filtroRegionFoto);
            const regionObject = await regiones.datosRegionByNombre(req.body.filtroRegionFoto);
            req.body.regionObject = regionObject;
            if (!req.file) {
                var appRootDir = path.dirname(require.main.filename);
                const pathToFile = appRootDir + '/views/roscadereyes/uploads/image.png';
                const originalname = 'image.png';
                const fieldname = 'image.png';
                req.file = {
                    path: pathToFile,
                    originalname: originalname,
                    fieldname: fieldname
                };
            }
            const empleadoSalvado = await empleados.cambiarEmpleadoStatusSeleccionado(req.body.ganadores);
            if (empleadoSalvado && empleadoSalvado._id) {
                req.body.filtroEmpleadosFoto = empleadoSalvado._id;
                fotos.salvarFoto(req, res);
            }

        });


};