var {Empleado} = require('../models/empleado.model');

var authenticate = (req, res, next) => {
    var token = req.header('x-auth');

    Empleado.findByToken(token).then((empleado) => {
        if (!empleado) return Promise.reject();

        req.empleado = empleado;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send({message: 'Necesita autenticarse para acceder a este elemento'});
    });
};

module.exports = {authenticate};