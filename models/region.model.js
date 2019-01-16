const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {ObjectID} = require('mongodb');

const regionSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la region es requerido.'],
        trim: true,
        unique: true
    },
    _id: {
        type: Schema.Types.ObjectId,
        ref: '{ref}'
    }
}, {collection: 'regiones'});

let Region = mongoose.model('Region', regionSchema);


list = (req, res) => {
    Region.find({}, (err, regiones) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando las regiones.',
                error: err
            });
        }
        return res.status(200).send({'regiones': regiones});
    });
};

findById = (req, res) => {
    if (ObjectID.isValid(req.params.id)) {
        Region.findOne({_id: req.params.id}, (err, region) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error consultando la region ' + req.params.id,
                    error: err
                });
            }
            if (!region) return res.status(404).send({message: 'Region no encontrada.'});
            return res.status(200).send({'region': region});
        });
    } else {
        return res.status(500).send({message: 'Identificador de region no valido.'});
    }
};

datosRegiones = () => {
    return Region.find({}, (err, regiones) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando las regiones.',
                error: err
            });
        }
        return regiones;
    });
};

datosRegionById = (id) => {
    return Region.findOne({_id: id}, (err, region) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando la region con id ' + id ,
                error: err
            });
        }
        return region;
    });
};

datosRegionByNombre = (nombre) => {
    return Region.findOne({nombre}, (err, region) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando la region con id ' + id ,
                error: err
            });
        }
        return region;
    });
};

module.exports = {
    list,
    findById,
    datosRegiones,
    datosRegionById,
    datosRegionByNombre
};