const mongoose = require('mongoose');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('<== database connection successful ==>'))
    .catch((err) => console.error(err));

module.exports = {mongoose};