'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RecordHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RecordHistory.init({
    affectedId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    property: DataTypes.STRING,
    newValue: DataTypes.TEXT,
    oldValue: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'RecordHistory',
  });
  return RecordHistory;
};