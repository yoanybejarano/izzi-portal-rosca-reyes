let premios = require('../models/premio.model');

module.exports = app => {
    app.get("/roscadereyes", async (req, res) => {
        // throw new  Error ('Log error into file');
        const listPremios = await premios.datosPremios();
        res.render('index', {premios: listPremios});
    });
};