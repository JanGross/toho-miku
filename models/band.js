'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Band extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Band.hasMany(models.Character);
    }
  }
  Band.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    imageURL: DataTypes.STRING,
    enabled: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Band',
  });
  return Band;
};