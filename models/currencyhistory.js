'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CurrencyHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CurrencyHistory.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  CurrencyHistory.init({
    userId: DataTypes.INTEGER,
    currency: DataTypes.INTEGER,
    delta: DataTypes.INTEGER,
    previous: DataTypes.INTEGER,
    source: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CurrencyHistory',
  });
  return CurrencyHistory;
};