const multer = require('multer');
const multerConfig = require('../config/fileupload');
const regiones = require('../models/region.model');
const empleados = require('../models/empleado.model');
const fotos = require('../models/foto.model');

module.exports = function (app) {
    app.route("/galeria")
        .all((req, res, next) => {
            // Middleware for preexecution of routes\
            delete req.body.id;
            next();
        })
        .get(async (req, res) => {
            const datosRegiones = await regiones.datosRegiones();
            const datosEmpleados = await empleados.datosEmpleados();
            res.render('gallery', {regiones: datosRegiones, empleados: datosEmpleados});
        });

    app.route("/upload")
        .all((req, res, next) => {
            // Middleware for preexecution of routes
            delete req.body.id;
            next();
        })
        .post(multer(multerConfig).single('photo'), async (req, res) => {
            const regionObject = await regiones.datosRegionById(req.body.region);
            req.body.regionObject = regionObject;
            fotos.salvarFoto(req, res);
            //Here is where I could add functions to then get the url of the new photo
            //And relocate that to a cloud storage solution with a callback containing its new url
            //then ideally loading that into your database solution.   Use case - user uploading an avatar...
            res.send('Complete! Check out your uploads folder.  Please note that files not encoded with an image mimetype are rejected. <a href="/galeria">try again</a>');
        });
};