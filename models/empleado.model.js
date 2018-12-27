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
    premio: {
        nombre: String,
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'premios'
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

EmpleadoSchema.statics.datosEmpleados = function () {
    return Empleado.find({}, (err, empleados) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando los empleados.',
                error: err
            });
        }
        return empleados;
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

login = async function (req, res, next) {
    try {
        const body = _.pick(req.body, ['email', 'password']);
        const empleadoResult = await Empleado.findByCredentials(body.email, body.password);
        const empleado = new Empleado(empleadoResult);
        const token = await empleado.generateAuth();
        res.setHeader('x-auth', token);
        const datosEmpleados = await Empleado.datosEmpleados();
        let datos = [];
        let regiones = [];
        let action;
        const regionesEncargados = await buscarRegionesConEncargados();
        const resultRegions = _.uniqBy(regionesEncargados, 'region');
        const regionesConEncargados = _.map(resultRegions, 'region');
        const regionesNoDisponibles = _.map(regionesConEncargados, 'nombre');
        let regionesDisponibles = [];
        switch (empleadoResult.rol.nombre) {
            case 'Encargado':
                datosEmpleados.forEach(item => {
                    if (item.region._id.toHexString() === empleadoResult.region._id.toHexString()) {
                        datos.push(item);
                    }
                });
                regiones = _.map(datos, 'region');
                regionesDisponibles = _.uniqBy(regiones, 'nombre');
                action = '/cambio_estatus';
                break;
            case 'Admin':
                datos = datosEmpleados;
                regiones = _.map(datos, 'region');
                regionesDisponibles = _.uniqBy(regiones, 'nombre').filter((item) => {
                    return !_.includes(regionesNoDisponibles, item.nombre);
                });
                action = '/empleado/cambiarRol';
                break;
        }

        res.render('admin', {
            empleados: datos,
            regiones: regionesDisponibles,
            rol: empleadoResult.rol.nombre,
            actionForm: action
        });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
};

logout = async function (req, res) {
    var token = req.header('x-auth');

    let tempEmployee = await Empleado.findByToken(token).then((empleado) => {
        if (!empleado) return Promise.reject();

        return empleado;
    }).catch((e) => {
        res.status(401).send({ message: 'Necesita autenticarse para acceder a este elemento' });
    });
    let empleado = await tempEmployee.removeToken(token);
    res.status(200).send({ empleado });
}

listSelectedEmployees = (req, res) => {
    // Empleado.find({ $and: [{ "seleccionado": true }, { premio: { "$eq": null } }] })
    Empleado.find({ "seleccionado": true }, (err, empleados) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando los empleados seleccionados.',
                error: err
            });
        }
        return res.status(200).send({ 'seleccionados': empleados });
    });
};

listWinnersEmployees = (req, res) => {
    Empleado.find({ 'premio': { "$ne": null } }, (err, empleados) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando los empleados seleccionados.',
                error: err
            });
        }
        return res.status(200).send({ 'premiados': empleados });
    });
};

findByNoEmpleado = (req, res) => {
    Empleado.findOne({ noEmpleado: req.params.noEmpleado }, (err, empleado) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando el empleado con el numero ' + req.params.noEmpleado,
                error: err
            });
        }
        if (!empleado) return res.status(200).send({ message: 'No se encontro empleados con el numero ' + req.params.noEmpleado });
        return res.status(200).send({ 'empleado': empleado });
    });
};

cambiarEmpleadoStatus = (req, res) => {
    const id = req.body.filtroEmpleados;
    const empleadoSeleccionado = req.body.empleadoSeleccionado === 'on' ? true : false;
    Empleado.findOneAndUpdate({ _id: id },
        { seleccionado: empleadoSeleccionado }, (err, empleado) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error consultando el empleado con el numero ' + req.params.noEmpleado,
                    error: err
                });
            }
            if (!empleado) return res.status(200).send({ message: 'No se encontro empleados con el numero ' + req.params.noEmpleado });
            return res.status(200).send({ 'empleado': empleado });
        });
}

findByRegion = (req, res) => {
    Empleado.find({ "region._id": req.params.idRegion }, (err, empleados) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando los empleados de la region ' + req.params.idRegion,
                error: err
            });
        }
        if (!empleados) return res.status(200).send({ message: 'No se encontro empleados con la region ' + req.params.idRegion });
        return res.status(200).send({ 'empleados': empleados });
    });
};

cambiarRol = (req, res) => {
    Empleado.findOneAndUpdate({ _id: req.body.filtroEmpleados },
        { rol: req.rol }, (err, empleado) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error consultando el empleado con el numero ' + req.params.noEmpleado,
                    error: err
                });
            }
            if (!empleado) return res.status(200).send({ message: 'No se encontro empleados con el numero ' + req.params.noEmpleado });
            return res.status(200).send({ 'empleado': empleado });
        });
}

datosEmpleados = function () {
    return Empleado.find({}, (err, empleados) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando los empleados.',
                error: err
            });
        }
        return empleados;
    });
};

datosEmpleadoById = function (id) {
    return Empleado.findById({ _id: id }, (err, empleado) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando el empleado.',
                error: err
            });
        }
        return empleado;
    });
};

asignarPremio = function (id, premio) {
    return Empleado.findOneAndUpdate({ _id: id }, { premio }, (err, empleado) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando el empleado.',
                error: err
            });
        }
        return empleado;
    });
}

buscarRegionesConEncargados = function () {
    return Empleado.find({ "rol.nombre": "Encargado" }, (err, empleados) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando el empleado.',
                error: err
            });
        }
        return empleados;
    });
}

module.exports = {
    Empleado,
    list,
    findById,
    create,
    login,
    logout,
    listSelectedEmployees,
    listWinnersEmployees,
    findByNoEmpleado,
    cambiarEmpleadoStatus,
    findByRegion,
    cambiarRol,
    datosEmpleados,
    datosEmpleadoById,
    asignarPremio
};