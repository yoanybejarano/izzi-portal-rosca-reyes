const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectID } = require('mongodb');
const _ = require('lodash');

const premioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del premio es requerido.'],
        trim: true,
        unique: true
    },
    icono: String,    
    disponibles: Number,
    _id: {
        type: Schema.Types.ObjectId,
        ref: '{ref}'
    },
    empleado: {
        nombre: String,
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'empleados'
        }
    }
}, { collection: 'premios' });
let Premio = mongoose.model('Premio', premioSchema);


list = (req, res) => {
    Premio.find({}, (err, premios) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando los premios.',
                error: err
            });
        }
        return res.status(200).send({ 'premios': premios });
    });
};

findById = (req, res) => {
    if (ObjectID.isValid(req.params.id)) {
        Premio.findOne({ _id: req.params.id }, (err, Premio) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error consultando el Premio ' + req.params.id,
                    error: err
                });
            }
            if (!Premio) return res.status(404).send({ message: 'Premio no encontrado.' });
            return res.status(200).send({ 'Premio': Premio });
        });
    } else {
        return res.status(500).send({ message: 'Identificador de premio no valido.' });
    }
};

findByNoEmpleado = (req, res) => {
    Premio.findOne({ "empleado.noEmpleado": req.params.noEmpleado }, (err, premio) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando el premio ' + req.params.id,
                error: err
            });
        }
        if (!premio) return res.status(200).send({ message: 'El empleado ' + req.params.noEmpleado + ' no se encuentra entre los ganadores.' });
        return res.status(200).send({ 'premio': premio });
    });
};

decrementarDisponibilidad = (req, res) => {
    Premio.findOneAndUpdate({ _id: req.params.idPremio }, { "$inc": { disponibles: -1 } }, (err, premio) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando el premio ' + req.params.id,
                error: err
            });
        }
        if (!premio) return res.status(200).send({ message: 'premio no encontrado.' });
        return res.status(200).send({ 'premio': premio });
    });
};

datosPremioByNombre = (nombre) => {
    return Premio.findOne({ nombre }, (err, Premio) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando el Premio con el nombre ' + nombre,
                error: err
            });
        }
        return Premio;
    });
};

datosPremioById = (id) => {
    return Premio.findOne({ _id: id }, (err, premio) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando el Premio con el nombre ' + nombre,
                error: err
            });
        }
        return premio;
    });
};

premiosDisponibles = (req, res) => {
    return Premio.find({ disponibles: { "$gt": 0 } }, (err, premios) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando los premios.',
                error: err
            });
        }
        return res.status(200).send({ 'disponibles': premios });
    });
};

listEmpleadosGanadores = (req, res) => {
    Premio.find({ "empleado": { "$ne": null } }, (err, premios) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando los premios.',
                error: err
            });
        }
        return res.status(200).send({ 'premiados': premios });
    });
};

datosEmpleadosGanadores = () => {
    return Premio.find({ "empleado": { "$ne": null } }, (err, premios) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando los premios sin asignar',
                error: err
            });
        }
        let ganadores = _.map(premios, 'empleado._id');
        return ganadores;
    });
};

datosPremios = (id) => {
    return Premio.find({}, (err, premios) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando los premios',
                error: err
            });
        }
        return premios;
    });
};

module.exports = {
    list,
    findById,
    datosPremioByNombre,
    datosPremioById,
    findByNoEmpleado,
    decrementarDisponibilidad,
    listEmpleadosGanadores,
    premiosDisponibles,
    datosEmpleadosGanadores,
    datosPremios
};