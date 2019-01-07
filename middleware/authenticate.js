const { Empleado } = require('../models/empleado.model');
const store = require('store');

const authenticate = (req, res, next) => {
    // const token = req.get('x-auth');
    const token = store.get('x-auth');

    Empleado.findByToken(token).then((empleado) => {
        if (!empleado) return Promise.reject();
        if(empleado.rol.nombre === 'Empleado') {
            return res.status(401).render('login', { layout: 'auth.hbs' });
        }
        req.empleado = empleado;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).render('login', { layout: 'auth.hbs' });
    });
};

module.exports = { authenticate };