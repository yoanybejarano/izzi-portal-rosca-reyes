var { Empleado } = require('../models/empleado.model');

var authenticate = (req, res, next) => {
    var token = req.get('x-auth');

    Empleado.findByToken(token).then((empleado) => {
        if (!empleado) return Promise.reject();

        req.empleado = empleado;
        req.token = token;
        next();
    }).catch((e) => {
        res.render('login', { layout: 'auth.hbs' });
    });
};

module.exports = { authenticate };