const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectID } = require('mongodb');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

let EmpleadoSchema = new mongoose.Schema({
    _id: {
        type: Schema.Types.ObjectId,
        ref: '{ref}'
    },
    noEmpleado: String,
    nombre: String,
    apellidos: String,
    area: String,
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} no es un email valido.'
        }
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    seleccionado: Boolean,
    premio: String,
    rol: {
        nombre: String,
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'roles'
        }
    },
    region: {
        nombre: String,
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'regiones'
        }
    },
    tokens: [{
        _id: false,
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
}, { collection: 'empleados' });

// EmpleadoSchema.methods.toJSON = function () {
//     let empleado = this;
//     let empleadoObject = empleado.toObject();
//     return _.pick(empleadoObject, ['_id', 'noEmpleado', 'email']);
// };

EmpleadoSchema.methods.generateAuth = function () {
    let empleado = this;
    let access = 'auth';
    let token = jwt.sign({ _id: empleado._id.toHexString(), access }, process.env.JWT_SECRET).toString();

    var accessToken = empleado.tokens.filter((token) => {
        return token.access === access;
    });
    if (accessToken[0]) {
        accessToken[0].token = token;
    } else {
        empleado.tokens.push({ access, token });
    }
    empleado.save();
    return token;
};

EmpleadoSchema.statics.findByToken = (token) => {
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return Promise.reject();
    }
    return Empleado.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};


EmpleadoSchema.pre('save', function (next) {
    let empleado = this;

    if (empleado.isModified('password')) {

        bcrypt.genSalt(10, (error, salt) => {
            bcrypt.hash(empleado.password, salt, (err, hash) => {
                empleado.password = hash;
                next();
            });
        });

    } else {
        next();
    }
});

EmpleadoSchema.statics.findByCredentials = function (email, password) {
    return Empleado.findOne({ email }, (err, empleado) => {
        if (!empleado) return Promise.reject({ message: 'Empleado no encontrado' });
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, empleado.password, (err, res) => {
                if (res) return empleado;
                else reject();
            });
        });
    });
};

EmpleadoSchema.methods.removeToken = function (token) {
    let empleado = this;
    return empleado.update({
        $pull: {
            tokens: { token }
        }
    });
};

let Empleado = mongoose.model('Empleado', EmpleadoSchema);

list = (req, res) => {
    Empleado.find({}, (err, empleados) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando los empleados.',
                error: err
            });
        }
        return res.status(200).send({ 'empleados': empleados });
    });
};

findById = (req, res) => {
    if (ObjectID.isValid(req.params.id)) {
        Empleado.findOne({ _id: req.params.id }, (err, empleado) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error consultando el empleado ' + req.params.id,
                    error: err
                });
            }
            if (!empleado) return res.status(404).send({ message: 'Empleado no encontrado.' });
            return res.status(200).send({ 'empleado': empleado });
        });
    } else {
        return res.status(500).send({ message: 'Identificador de empleado no valido.' });
    }
};


create = async function (req, res) {
    try {
        // const body = _.pick(req.body, ['email', 'password']);
        let empleado = new Empleado(req.body);
        empleado._id = new ObjectID();
        const token = empleado.generateAuth();
        res.header('x-auth', token).send(empleado);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
};

login = async function (req, res) {
    try {
        const body = _.pick(req.body, ['email', 'password']);
        const empleadoResult = await Empleado.findByCredentials(body.email, body.password);
        const empleado = new Empleado(empleadoResult);
        const token = await empleado.generateAuth();
        res.header('x-auth', token).send(empleado);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
};

logout = async function (req, res) {
    var token = req.header('x-auth');
    let tempEmployee = new Empleado();
    let empleado = await tempEmployee.removeToken(token);
    res.status(200).send({ empleado });
}

module.exports = { Empleado, list, findById, create, login, logout };






















