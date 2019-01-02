const multer = require('multer');
const path = require('path');
const fs = require('fs');

//MULTER CONFIG: to get file photos to temp server storage
const multerConfig = {

    //specify diskStorage (another option is memory)
    storage: multer.diskStorage({

        //specify destination
        destination: function (req, file, next) {

            var appRootDir = path.dirname(require.main.filename);
            const startPath = appRootDir + '/views/' + process.env.UPLOADS_FOLDER;

            if (!fs.existsSync(startPath)) {
                console.log("No existe el directorio ", startPath);
                fs.mkdirSync(startPath);
            }
            destinationPath = './views/' + process.env.UPLOADS_FOLDER;
            next(null, destinationPath);
        },

        //specify the filename to be unique
        filename: function (req, file, next) {
            // console.log(file);
            //get the file mimetype ie 'image/jpeg' split and prefer the second value ie'jpeg'
            const ext = file.mimetype.split('/')[1];
            //set the file fieldname to a unique name containing the original name, current datetime and the extension.
            // next(null, file.fieldname + '-' + Date.now() + '.'+ext);
            next(null, file.originalname);
        }
    }),

    // filter out and prevent non-image files.
    fileFilter: function (req, file, next) {
        if (!file) {
            next();
        }

        // only permit image mimetypes
        const image = file.mimetype.startsWith('image/');
        if (image) {
            console.log('Foto subida correctamente.');
            next(null, true);
        } else {
            console.log("Archivo no soportado.")
            //TODO:  A better message response to user on failure.
            return next();
        }
    }
};

module.exports = multerConfig;