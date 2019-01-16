const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {ObjectID} = require('mongodb');
const path = require('path');
const fs = require('fs');
const appRootDir = path.dirname(require.main.filename);
const startPath = appRootDir + '/views/roscadereyes' + process.env.UPLOADS_FOLDER;
const _ = require('lodash');


const FotoSchema = new mongoose.Schema({
    _id: {
        type: Schema.Types.ObjectId,
        ref: '{ref}'
    },
    archivo: String,
    localidad: String,
    empleado: {
        type: Schema.Types.ObjectId,
        ref: 'empleados'
    },
    region: {
        nombre: String,
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'regiones'
        }
    }
}, {collection: 'fotos'});

let Foto = mongoose.model('fotos', FotoSchema);


list = (req, res) => {
    Foto.find({}, (err, fotos) => {
        if (err) {
            return res.status(500).json({
                message: 'Error consultando los datos de fotos.',
                error: err
            });
        }
        return res.status(200).send({'fotos': fotos});
    });
};

findById = (req, res) => {
    if (ObjectID.isValid(req.params.id)) {
        Foto.findOne({_id: req.params.id}, (err, foto) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error consultando la foto ' + req.params.id,
                    error: err
                });
            }
            if (!fotos) return res.status(404).send({message: 'Foto no encontrada.'});
            return res.status(200).send({'foto': foto});
        });
    } else {
        return res.status(500).send({message: 'Identificador de foto no valido.'});
    }
};

datosFotos = () => {
    return Foto.find({}, (err, fotos) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando las fotos.',
                error: err
            });
        }
        return fotos;
    });
};

// datosFotosPerfiles = () => {
//     return Foto.find({'empleado': {$ne: null}}, {empleado: 1, region: 1, localidad: 1}, (err, fotos) => {
//         if (err) {
//             return Promise.reject({
//                 message: 'Error consultando las fotos.',
//                 error: err
//             });
//         }
//         return fotos;
//     });
// };

datosFotosPerfiles = () => {
    return Foto.distinct('empleado', (err, fotos) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando las fotos.',
                error: err
            });
        }
        return fotos;
    });
};

datosFotosEvento = () => {
    return Foto.find({'empleado': {$eq: null}}, (err, fotos) => {
        if (err) {
            return Promise.reject({
                message: 'Error consultando las fotos.',
                error: err
            });
        }
        return fotos;
    }).sort({$natural: -1}).limit(8);
};

salvarFoto = (req, res) => {
    let localidad = '';
    if (req.body.localidad && req.body.localidad !== 'Seleccione') {
        localidad = req.body.localidad;
    } else if (req.body.localidadEvento && req.body.localidadEvento !== 'Seleccione') {
        localidad = req.body.localidadEvento;
    }else {
        localidad = null;
    }
    const empleado = req.body.filtroEmpleadosFoto;
    const archivo = req.file.filename;
    const region = req.body.regionObject;
    let foto = new Foto({archivo, empleado, region, localidad});
    foto._id = new ObjectID();
    foto.save();
    res.status(200).redirect('/roscadereyes/admin');
};

salvarFotoPerfil = (filtroEmpleadosFoto, nombreArchivo, filtroRegionFoto, nombreRegion) => {
    const empleado = ObjectID(filtroEmpleadosFoto);
    const archivo = nombreArchivo;
    const region = {"_id": filtroRegionFoto, "nombre": nombreRegion};
    let foto = new Foto({archivo, empleado, region});
    foto._id = new ObjectID();
    foto.save();
};

listaDatosArchivosEvento = async (region) => {
    let viewData = [];
    let fotos;
    if (region) {
        fotos = await datosFotosEvento().filter((item) => {
            item.region === region;
        });
    } else {
        fotos = await datosFotosEvento();
    }

    if (!fs.existsSync(startPath)) {
        console.log("No existe el directorio ", startPath);
        return;
    }

    const archivosFotos = fs.readdirSync(startPath);
    if (archivosFotos.length > 0 && fotos.length > 0) {
        archivosFotos.forEach((element, index) => {
            const datosFoto = fotos.filter((item) => {
                return item.archivo === element
            });
            // if (datosFoto[0]){
            //     const viewArchivo = {
            //         "datosArchivo": datosFoto[0],
            //         "archivoDir": '/roscadereyes' + process.env.UPLOADS_FOLDER + '/' + datosFoto[0].archivo
            //     };
            //     viewData.push(viewArchivo);
            // }
            if (datosFoto.length > 0) {
                datosFoto.forEach((element, index) => {
                    const viewArchivo = {
                        "datosArchivo": element,
                        "archivoDir": '/roscadereyes' + process.env.UPLOADS_FOLDER + '/' + datosFoto[0].archivo
                    };
                    viewData.push(viewArchivo);
                });
            }
        });
    }
    return viewData.reverse();

};

listaDatosArchivosPerfiles = async (region) => {
    let viewData = [];
    let fotos;
    if (region) {
        fotos = await datosFotosPerfiles().filter((item) => {
            item.region === region;
        });
    } else {
        fotos = await datosFotosPerfiles();
    }

    if (!fs.existsSync(startPath)) {
        console.log("No existe el directorio ", startPath);
        return;
    }

    // const archivosFotos = fs.readdirSync(startPath);
    // if (archivosFotos.length > 0 && fotos.length > 0) {
    //     archivosFotos.forEach((element, index) => {
    //         const datosFoto = fotos.filter((item) => {
    //             return item.archivo === element
    //         });
    //         if (datosFoto.length > 0) {
    //             datosFoto.forEach((element, index) => {
    //                 const viewArchivo = {
    //                     "datosArchivo": element,
    //                     "archivoDir": '/roscadereyes' + process.env.UPLOADS_FOLDER + '/' + datosFoto[0].archivo
    //                 };
    //                 viewData.push(viewArchivo);
    //             });
    //         }
    //     });
    // }

    // const employees = _.map(
    //     _.uniq(
    //         _.map(fotos, function(obj){
    //             return JSON.stringify(obj.empleado);
    //         })
    //     ), function(obj) {
    //         return JSON.parse(obj);
    //     }
    // );

    // if (employees.length > 0) {
    //     employees.forEach((element, index) => {
    //         const viewArchivo = {
    //             "datosArchivo": element
    //         };
    //         viewData.push(viewArchivo);
    //     });
    // }

    // return viewData.reverse();

    return fotos;
};

listaArchivos = async (req, res) => {
    let viewData = [];
    let fotos;
    if (req.params.id) {
        const id_region = req.params.id;
        fotosList = await datosFotos();
        fotos = fotosList.filter((item) => {
            return item.region._id.toHexString() === id_region;
        });
    } else {
        fotos = await datosFotos();
    }

    if (!fs.existsSync(startPath)) {
        console.log("No existe el directorio ", startPath);
        return;
    }

    const archivosFotos = fs.readdirSync(startPath);
    if (archivosFotos.length && fotos) {
        archivosFotos.forEach((element, index) => {
            let datosFoto = [];
            fotos.forEach((item, index) => {
                if (item.archivo === element) {
                    datosFoto.push(item);
                }
            });
            if (datosFoto.length > 0) {
                const viewArchivo = {
                    "datosArchivo": datosFoto[0],
                    "archivoDir": process.env.UPLOADS_FOLDER + '/' + datosFoto[0].archivo
                };
                viewData.push(viewArchivo);
            }
        });
    }
    return res.status(200).send({archivos: viewData});
};

module.exports = {
    list,
    findById,
    datosFotos,
    salvarFoto,
    listaDatosArchivosEvento,
    listaArchivos,
    listaDatosArchivosPerfiles,
    salvarFotoPerfil
};