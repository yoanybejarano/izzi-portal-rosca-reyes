const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {ObjectID} = require('mongodb');

const rolSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del rol es requerido.'],
        trim: true,
        unique: true
    },
    _id: {
        type: Schema.Types.ObjectId,
        ref: '{ref}'
    }
}, {collection: 'roles'});
let Rol = mongoose.model('Rol', rolSchema);


list = (req, res) => {
    Rol.find({}, (err, roles) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando los roles.',
                error: err
            });
        }
        return res.status(200).send({'roles': roles});
    });
};

findById = (req, res) => {
    if (ObjectID.isValid(req.params.id)) {
        Rol.findOne({_id: req.params.id}, (err, rol) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error consultando el rol ' + req.params.id,
                    error: err
                });
            }
            if (!rol) return res.status(404).send({message: 'Rol no encontrado.'});
            return res.status(200).send({'rol': rol});
        });
    } else {
        return res.status(500).send({message: 'Identificador de rol no valido.'});
    }
};

module.exports = {
    list,
    findById
};