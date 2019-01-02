const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectID } = require('mongodb');
const path = require('path');
const fs = require('fs');

const FotoSchema = new mongoose.Schema({
    _id: {
        type: Schema.Types.ObjectId,
        ref: '{ref}'
    },
    archivo: String,
    empleado: {
        type: Schema.Types.ObjectId,
        ref: 'empleados'
    },
    region: {
        nombre: String,
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'regiones'
        }
    }
}, { collection: 'fotos' });

let Foto = mongoose.model('fotos', FotoSchema);


list = (req, res) => {
    Foto.find({}, (err, fotos) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando los datos de fotos.',
                error: err
            });
        }
        return res.status(200).send({ 'fotos': fotos });
    });
};

findById = (req, res) => {
    if (ObjectID.isValid(req.params.id)) {
        Foto.findOne({ _id: req.params.id }, (err, foto) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error consultando la foto ' + req.params.id,
                    error: err
                });
            }
            if (!fotos) return res.status(404).send({ message: 'Foto no encontrada.' });
            return res.status(200).send({ 'foto': foto });
        });
    } else {
        return res.status(500).send({ message: 'Identificador de foto no valido.' });
    }
};

datosFotos = () => {
    return Foto.find({}, (err, fotos) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando las fotos.',
                error: err
            });
        }
        return fotos;
    });
};

salvarFoto = (req, res) => {
    const empleado = req.body.filtroEmpleados ? ObjectID(req.body.filtroEmpleados) : null;
    const archivo = req.file.originalname;
    console.log(req.body.filtroRegiones);
    const region = { "_id": req.body.filtroRegiones, "nombre": req.body.regionObject.nombre };
    let foto = new Foto({ archivo, empleado, region });
    foto._id = new ObjectID();
    foto.save();
};

listaDatosArchivos = async (region) => {
    let viewData = [];
    let fotos;
    if (region) {
        fotos = await datosFotos().filter((item) => {
            item.region === region;
        });
    } else {
        fotos = await datosFotos();
    }

    var appRootDir = path.dirname(require.main.filename);
    const startPath = appRootDir + '/views/' + process.env.UPLOADS_FOLDER;
    // const startPath = appRootDir + '/' + process.env.UPLOADS_FOLDER;
    if (!fs.existsSync(startPath)) {
        console.log("No existe el directorio ", startPath);
        return;
    }

    const archivosFotos = fs.readdirSync(startPath);
    if (archivosFotos.length > 0 && fotos.length > 0) {
        archivosFotos.forEach((element, index) => {
            const datosFoto = fotos.filter((item) => { return item.archivo === element });
            const viewArchivo = {
                "datosArchivo": datosFoto[0],
                "archivoDir": process.env.UPLOADS_FOLDER + '/' + datosFoto[0].archivo
            };
            viewData.push(viewArchivo);
        });
    }
    return viewData;
};

listaArchivos = async (req, res) => {
    let viewData = [];
    let fotos;
    if (req.params.id) {
        const id_region = req.params.id;
        fotosList = await datosFotos();
        fotos = fotosList.filter((item) => {
            return item.region._id.toHexString() === id_region;
        });
    } else {
        fotos = await datosFotos();
    }

    var appRootDir = path.dirname(require.main.filename);
    const startPath = appRootDir + '/views/' + process.env.UPLOADS_FOLDER;
    // const startPath = appRootDir + '/' + process.env.UPLOADS_FOLDER;
    if (!fs.existsSync(startPath)) {
        console.log("No existe el directorio ", startPath);
        return;
    }

    const archivosFotos = fs.readdirSync(startPath);
    if (archivosFotos.length && fotos) {
        archivosFotos.forEach((element, index) => {
            let datosFoto = [];
            fotos.forEach((item, index) => {
                if (item.archivo === element) {
                    datosFoto.push(item);
                }
            });
            if (datosFoto.length > 0) {
                const viewArchivo = {
                    "datosArchivo": datosFoto[0],
                    "archivoDir": process.env.UPLOADS_FOLDER + '/' + datosFoto[0].archivo
                };
                viewData.push(viewArchivo);
            }
        });
    }
    return res.status(200).send({ archivos: viewData });
};

module.exports = {
    list,
    findById,
    datosFotos,
    salvarFoto,
    listaDatosArchivos,
    listaArchivos
};