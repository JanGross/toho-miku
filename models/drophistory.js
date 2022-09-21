'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DropHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DropHistory.init({
    dropData: DataTypes.JSON,
    type: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'DropHistory',
  });
  return DropHistory;
};