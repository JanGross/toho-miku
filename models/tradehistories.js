'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TradeHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TradeHistory.init({
    userAId: DataTypes.INTEGER,
    userBId: DataTypes.INTEGER,
    userATraded: DataTypes.JSON,
    userBTraded: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'TradeHistory',
  });
  return TradeHistory;
};