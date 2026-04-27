'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const { database } = require('../config');
const config = database[env];
const db = {};

// Initialize Sequelize instances for each database
const sequelizeDb1 = new Sequelize(config.database1.database, config.database1.username, config.database1.password, config.database1, {
  ...config.database1,
  port: config.database1.port   // ensure port is included
});
const sequelizeDb2 = new Sequelize(config.database2.database, config.database2.username, config.database2.password, config.database2);

// Function to load models for a given Sequelize instance
const loadModels = (sequelizeInstance, dbObject) => {
  fs
    .readdirSync(__dirname)
    .filter(file => {
      return (
        file.indexOf('.') !== 0 &&
        file !== basename &&
        file.slice(-3) === '.js' &&
        file.indexOf('.test.js') === -1
      );
    })
    .forEach(file => {
      const model = require(path.join(__dirname, file))(sequelizeInstance, Sequelize.DataTypes);
      dbObject[model.name] = model;
    });

  Object.keys(dbObject).forEach(modelName => {
    if (dbObject[modelName].associate) {
      dbObject[modelName].associate(dbObject);
    }
  });
};

// Load models for each database
loadModels(sequelizeDb1, db);
loadModels(sequelizeDb2, db);

db.sequelizeDb1 = sequelizeDb1;
db.sequelizeDb2 = sequelizeDb2;
db.Sequelize = Sequelize;

module.exports = db;



















// 'use strict';

// const fs = require('fs');
// const path = require('path');
// const Sequelize = require('sequelize');
// const process = require('process');
// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';
// const config = require(__dirname + '/../config/config.json')[env];
// const db = {};

// let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

// fs
//   .readdirSync(__dirname)
//   .filter(file => {
//     return (
//       file.indexOf('.') !== 0 &&
//       file !== basename &&
//       file.slice(-3) === '.js' &&
//       file.indexOf('.test.js') === -1
//     );
//   })
//   .forEach(file => {
//     const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   });

// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;
