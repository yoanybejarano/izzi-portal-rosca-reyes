const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {ObjectID} = require('mongodb');

const limiteSchema = new mongoose.Schema({
    key: String,
    value: Number,
    _id: {
        type: Schema.Types.ObjectId,
        ref: '{ref}'
    }
}, {collection: 'limites'});

let Limite = mongoose.model('Limite', limiteSchema);

list = (req, res) => {
    Limite.find({}, (err, limites) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando los limites.',
                error: err
            });
        }
        return res.status(200).send({'limites': limites});
    });
};

findById = (req, res) => {
    if (ObjectID.isValid(req.params.id)) {
        Limite.findOne({_id: req.params.id}, (err, limite) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error consultando el limite ' + req.params.id,
                    error: err
                });
            }
            if (!limite) return res.status(404).send({message: 'Limite no encontrado.'});
            return res.status(200).send({'limite': limite});
        });
    } else {
        return res.status(500).send({message: 'Identificador de limite no valido.'});
    }
}

modificarCantidadSeleccionados = (req, res) => {
    const cantidadLimite = req.body.cantidadLimite;
    Limite.findOneAndUpdate({key: "Seleccionados"},
        {value: cantidadLimite}, (err, limite) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error consultando el limite de los Seleccionados.',
                    error: err
                });
            }
            if (!limite) return res.status(200).send({message: 'No se encontro limites con el nombre Seleccionados.'});
            return res.status(200).send({'nuevaCantidad': cantidadLimite});
        });
}

limiteByNombre = (req, res) => {
    return Limite.findOne({key: req.params.keyName}, (err, limite) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando el limite con el nombre ' + nombre,
                error: err
            });
        }
        return res.status(200).send({'limite': limite});
    });
};

datosLimiteByNombre = function (nombre) {
    return Limite.findOne({key: nombre}, (err, limite) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando el limite con el nombre ' + nombre,
                error: err
            }).catch(() => {
            });
        }
        return limite;
    });
};

module.exports = {
    list,
    findById,
    datosLimiteByNombre,
    modificarCantidadSeleccionados,
    limiteByNombre
};



