const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {ObjectID} = require('mongodb');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const store = require('store');

let EmpleadoSchema = new mongoose.Schema({
    _id: {
        type: Schema.Types.ObjectId,
        ref: '{ref}'
    },
    noEmpleado: String,
    nombre: String,
    apellidos: String,
    area: String,
    email: String,
    localidad: String,
    antiguedad: Date,
    password: {
        type: String,
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
}, {collection: 'empleados'});

// EmpleadoSchema.methods.toJSON = function () {
//     let empleado = this;
//     let empleadoObject = empleado.toObject();
//     return _.pick(empleadoObject, ['_id', 'noEmpleado', 'email']);
// };

EmpleadoSchema.methods.generateAuth = function () {
    let empleado = this;
    let access = 'auth';
    let token = jwt.sign({_id: empleado._id.toHexString(), access}, process.env.JWT_SECRET).toString();

    var accessToken = empleado.tokens.filter((token) => {
        return token.access === access;
    });
    if (accessToken[0]) {
        accessToken[0].token = token;
    } else {
        empleado.tokens.push({access, token});
    }
    empleado.save(function (err, savedEmpleado) {
        var employeeId = savedEmpleado._id;
    });
    ;
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

EmpleadoSchema.statics.datosEmpleadosPorRegion = function (idRegion) {
    return Empleado.find({'region._id': idRegion}, (err, empleados) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando los empleados.',
                error: err
            }).catch(() => {
            });
        }
        return empleados;
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
    return Empleado.findOne({email}, (err, empleado) => {
        if (!empleado) return Promise.reject({message: 'Empleado no encontrado'}).catch(() => {
        });
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, empleado.password, (err, res) => {
                if (res) return empleado;
            });
        });
    });
};

EmpleadoSchema.methods.removeToken = function (token) {
    let empleado = this;
    return empleado.update({
        $pull: {
            tokens: {token}
        }
    });
};

EmpleadoSchema.statics.datosEmpleados = function () {
    return Empleado.find({}, (err, empleados) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando los empleados.',
                error: err
            }).catch(() => {
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
        return res.status(200).send({'empleados': empleados});
    });
};

findById = (req, res) => {
    if (ObjectID.isValid(req.params.id)) {
        Empleado.findOne({_id: req.params.id}, (err, empleado) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error consultando el empleado ' + req.params.id,
                    error: err
                });
            }
            if (!empleado) return res.status(404).send({message: 'Empleado no encontrado.'});
            return res.status(200).send({'empleado': empleado});
        });
    } else {
        return res.status(500).send({message: 'Identificador de empleado no válido.'});
    }
};


create = async function (req, res) {
    try {
        // const body = _.pick(req.body, ['email', 'password']);
        let empleado = new Empleado(req.body);
        empleado._id = new ObjectID();
        const token = empleado.generateAuth();
        res.header('x-auth', token).send(empleado);
        // res.body.token = token;
    } catch (err) {
        res.status(400).send({message: err.message});
    }
};

login = async function (req, res) {
    try {
        const body = _.pick(req.body, ['email', 'password']);
        const empleadoResult = await Empleado.findByCredentials(body.email, body.password);
        if (empleadoResult.rol.nombre === 'Empleado') {
            return res.status(401).render('login', {layout: 'auth.hbs'});
        }
        const regionUsuario = [empleadoResult.region];
        const empleado = new Empleado(empleadoResult);
        const token = await empleado.generateAuth();
        // const header = {'x-auth': token};
        const datosEmpleados = await Empleado.datosEmpleadosPorRegion(empleadoResult.region._id);
        let datos = [];
        let regiones = [];
        let action;
        // const regionesEncargados = await buscarRegionesConEncargados();
        // const resultRegions = _.uniqBy(regionesEncargados, 'region');
        // const regionesConEncargados = _.map(resultRegions, 'region');
        // const regionesNoDisponibles = _.map(regionesConEncargados, 'nombre');
        let regionesDisponibles = req.body.regiones;
        switch (empleadoResult.rol.nombre) {
            case 'Encargado':
                datosEmpleados.forEach(item => {
                    if (item.region._id.toHexString() === empleadoResult.region._id.toHexString()) {
                        datos.push(item);
                    }
                });
                regiones = _.map(datos, 'region');
                // regionesDisponibles = _.uniqBy(regiones, 'nombre');
                action = '/roscadereyes/cambio_estatus';
                break;
            case 'Admin':
                datos = datosEmpleados;
                regiones = _.map(datos, 'region');
                // regionesDisponibles = _.uniqBy(regiones, 'nombre').filter((item) => {
                //     return !_.includes(regionesNoDisponibles, item.nombre);
                // });
                action = '/roscadereyes/empleado/cambiarRol';
                break;
        }
        var scripts = [
            {script: 'https://momentjs.com/downloads/moment-with-locales.js'},
            {script: '/rosca/assets/js/client.js'}
        ];
        store.set('x-auth', token);
        const cantidadSeleccionados = await countSelectedEmployeesByRegion(empleadoResult.region._id);
        // res.header('x-auth', token);
        res.render('admin', {
            scripts: scripts,
            empleados: datos,
            regiones: regionesDisponibles,
            rol: empleadoResult.rol.nombre,
            actionForm: action,
            regionesDisponibles: regionesDisponibles,
            evento: req.body.datosArchivosEvento,
            perfiles: req.body.empleadosPerfil,
            seleccionados: cantidadSeleccionados,
            limitesSeleccion: req.body.limitesSeleccion
        });
    } catch (err) {
        res.status(400).send({message: err.message});
    }
};

logout = async function (req, res) {
    // const token = req.header('x-auth');
    const token = store.get('x-auth');

    let tempEmployee = await Empleado.findByToken(token).then((empleado) => {
        if (!empleado) return Promise.reject();

        return empleado;
    }).catch((e) => {
        res.status(401).send({message: 'Necesita autenticarse para acceder a este elemento'});
    });
    let empleado = await tempEmployee.removeToken(token);
    store.remove('x-auth');
    res.status(200).redirect('/roscadereyes/galeria');
}

listSelectedEmployees = (req, res) => {
    // Empleado.find({ $and: [{ "seleccionado": true }, { premio: { "$eq": null } }] })
    Empleado.find({"seleccionado": true}, (err, empleados) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando los empleados seleccionados.',
                error: err
            });
        }
        return res.status(200).send({'seleccionados': empleados});
    });
};

listWinnersEmployees = (req, res) => {
    Empleado.find({'premio': {"$ne": null}}, (err, empleados) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando los empleados seleccionados.',
                error: err
            });
        }
        return res.status(200).send({'premiados': empleados});
    });
};

findByNoEmpleado = (req, res) => {
    Empleado.findOne({noEmpleado: req.params.noEmpleado}, (err, empleado) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando el empleado con el número ' + req.params.noEmpleado,
                error: err
            });
        }
        if (!empleado) return res.status(200).send({message: 'No se encontró empleados con el número ' + req.params.noEmpleado});
        return res.status(200).send({'empleado': empleado});
    });
};

findDatosByNoEmpleado = (noEmpleado) => {
    Empleado.findOne({noEmpleado}, (err, empleado) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando el empleado.',
                error: err
            }).catch(() => {
            });
        }
        return empleado;
    });
};

findByNoEmpleadoAndRegion = (req, res) => {
    Empleado.findOne({noEmpleado: req.params.noEmpleado, 'region._id': req.params.idregion}, (err, empleado) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando el empleado con el número ' + req.params.noEmpleado,
                error: err
            });
        }
        if (!empleado) return res.status(200).send({message: 'No se encontró empleados con el número ' + req.params.noEmpleado});
        return res.status(200).send({'empleado': empleado});
    });
};

cambiarEmpleadoStatus = (req, res) => {
    const id = req.body.filtroEmpleados;
    Empleado.findOneAndUpdate({_id: id},
        {seleccionado: true}, (err, empleado) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error consultando el empleado con el número ' + req.params.noEmpleado,
                    error: err
                });
            }
            if (!empleado) return res.status(200).send({message: 'No se encontró empleados con el número ' + req.params.noEmpleado});
            // return res.status(200).send({'empleado': empleado});
        });
}

findByRegion = (req, res) => {
    Empleado.find({"region._id": req.params.idRegion}, (err, empleados) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando los empleados de la region ' + req.params.idRegion,
                error: err
            });
        }
        if (!empleados) return res.status(200).send({message: 'No se encontró empleados con la region ' + req.params.idRegion});
        return res.status(200).send({'empleados': empleados});
    });
};

cambiarRol = (req, res) => {
    Empleado.findOneAndUpdate({_id: req.body.filtroEmpleados},
        {rol: req.rol}, (err, empleado) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error consultando el empleado con el número ' + req.params.noEmpleado,
                    error: err
                });
            }
            if (!empleado) return res.status(200).send({message: 'No se encontró empleados con el número ' + req.params.noEmpleado});
            return res.status(200).send({'empleado': empleado});
        });
}

datosEmpleados = function () {
    return Empleado.find({}, (err, empleados) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando los empleados.',
                error: err
            }).catch(() => {
            });
        }
        return empleados;
    });
};

datosEmpleadosById = function (list_Ids) {
    return Empleado.find({'_id': {$in: list_Ids}}, (err, empleados) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando los empleados.',
                error: err
            }).catch(() => {
            });
        }
        return empleados;
    });
};


datosEmpleadoById = function (id) {
    return Empleado.findById({_id: id}, (err, empleado) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando el empleado.',
                error: err
            }).catch(() => {
            });
        }
        return empleado;
    });
};

asignarPremio = function (id, premio) {
    return Empleado.findOneAndUpdate({_id: id}, {premio}, (err, empleado) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando el empleado.',
                error: err
            }).catch(() => {
            });
        }
        return empleado;
    });
};

buscarRegionesConEncargados = function () {
    return Empleado.find({"rol.nombre": "Encargado"}, (err, empleados) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando el empleado.',
                error: err
            }).catch(() => {
            });
        }
        return empleados;
    });
};

countSelectedEmployeesByRegion = (regionId) => {
    return Empleado.find({$and: [{"seleccionado": true}, {"region._id": regionId}]}).countDocuments();
};

crear = async function (empleadoData) {
    try {
        empleado = new Empleado(empleadoData);
        empleado._id = new ObjectID();
        // const token = empleado.generateAuth();
        const empleadoNuevo = await empleado.save();
        return empleadoNuevo;
    } catch (err) {
        console.log(err);
    }
};

loadAdmin = async function (req, res) {
    try {
        const token = store.get('x-auth');
        const empleadoResult = await Empleado.findByToken(token);
        const regionUsuario = [empleadoResult.region];
        const empleado = new Empleado(empleadoResult);
        const datosEmpleados = await Empleado.datosEmpleadosPorRegion(empleadoResult.region._id);
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
                action = '/roscadereyes/cambio_estatus';
                break;
            case 'Admin':
                // datos = datosEmpleados;
                regiones = _.map(datos, 'region');
                regionesDisponibles = _.uniqBy(regiones, 'nombre').filter((item) => {
                    return !_.includes(regionesNoDisponibles, item.nombre);
                });
                action = '/roscadereyes/empleado/cambiarRol';
                break;
        }
        // store.set('x-auth', token);
        // res.header('x-auth', token);
        var scripts = [
            {script: 'https://momentjs.com/downloads/moment-with-locales.js'},
            {script: '/rosca/assets/js/client.js'},
            {script: 'https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js'}
        ];
        const cantidadSeleccionados = await countSelectedEmployeesByRegion(empleadoResult.region._id);
        res.render('admin', {
            scripts: scripts,
            empleados: datos,
            regiones: regionesDisponibles,
            rol: empleadoResult.rol.nombre,
            actionForm: action,
            usuarioRegion: regionUsuario,
            evento: req.body.datosArchivosEvento,
            perfiles: req.body.empleadosPerfil,
            seleccionados: cantidadSeleccionados,
            limitesSeleccion: req.body.limitesSeleccion
        });
    } catch (err) {
        res.status(400).send({message: err.message});
    }
};

findByTokenCode = function (token) {
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

listEmpleadosIds = function (req, res) {
    Empleado.find({'region._id': req.params.regionId, 'rol.nombre': 'Empleado'}, {
        noEmpleado: 1,
        _id: 0
    }, (err, identificadores) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando los empleados.',
                error: err
            });
        }
        return res.status(200).send({'identificadores': identificadores});
    });
}

cambiarEmpleadoStatusSeleccionado = function (noEmpleado) {
    return Empleado.findOneAndUpdate({noEmpleado: noEmpleado},
        {seleccionado: true}, (err, empleado) => {
            if (err) {
                return Promise.reject({
                    message: 'Error consultando el empleado con el número ' + req.params.noEmpleado,
                    error: err
                });
            }
            return empleado;
        });
}

listaLocalidadesPorRegion = function (req, res) {
    return Empleado.find({"region._id": req.params.regionId}, {localidad: 1, _id: 0}, (err, localidades) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando las localidades.',
                error: err
            }).catch(() => {
            });
        }
        return res.status(200).send({'localidades': _.uniqBy(localidades, 'localidad')});
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
    asignarPremio,
    countSelectedEmployeesByRegion,
    datosEmpleadosById,
    crear,
    findDatosByNoEmpleado,
    loadAdmin,
    findByTokenCode,
    listEmpleadosIds,
    cambiarEmpleadoStatusSeleccionado,
    findByNoEmpleadoAndRegion,
    listaLocalidadesPorRegion
};