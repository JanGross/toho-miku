'use strict';

const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const utils = {};

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const util = require(path.join(__dirname, file));
    utils[util.name] = util;
    console.log(`Registered Store: ${util.name}`);
  });

Object.keys(utils).forEach(modelName => {
  if (utils[modelName].associate) {
    utils[modelName].associate(utils);
  }
});

module.exports = utils;