const mongoose = require('mongoose');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('<== Connection successful to database ' + process.env.MONGODB_URI + ' ==>'))
    .catch((err) => console.error("<== Can't established connection to database " + process.env.MONGODB_URI + " ==>"));

module.exports = {mongoose};