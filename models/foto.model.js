const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectID } = require('mongodb');
const _ = require('lodash');

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
    return fotos.find({}, (err, fotos) => {
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
    const empleado = req.body.empleado;
    const archivo = req.file.originalname;
    console.log(req.body.region);
    const region = { "_id": req.body.region, "nombre": req.body.regionObject.nombre };
    let foto = new Foto({ archivo, empleado, region });
    foto._id = new ObjectID();
    foto.save();
};

module.exports = {
    list,
    findById,
    datosFotos,
    salvarFoto
};