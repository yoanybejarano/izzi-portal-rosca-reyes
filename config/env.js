// let env = process.argv[2];

// if (env === 'dev' || env === 'test' || env === 'prod') {
//     let config = require('./env.json');
//     let envConfig = config[env];

//     Object.keys(envConfig).forEach((key) => {
//         process.env[key] = envConfig[key];
//         console.log(process.env[key]);
//     });
// }

let env = process.env.NODE_ENV || 'dev';

if (env === 'test' || env === 'dev') {
    let config = require('./env.json');
    let envConfig = config[env];

    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key];
    });
}

