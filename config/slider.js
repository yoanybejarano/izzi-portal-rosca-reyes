const Gallery = require('express-photo-gallery');
const imagesPath = './views/roscadereyes/' + process.env.UPLOADS_FOLDER;

const options = {
    title: 'Rosca de Reyes 2018'
};

const gallery = Gallery(imagesPath, options);

module.exports = gallery;