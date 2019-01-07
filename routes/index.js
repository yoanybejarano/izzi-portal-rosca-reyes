let premios = require('../models/premio.model');

module.exports = app => {
    app.get("/roscadereyes", async (req, res) => {
        const listPremios = await premios.datosPremios();
        res.render('index', {premios: listPremios});
    });
};