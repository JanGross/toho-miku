'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Card extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Card.belongsTo(models.Character, {
        foreignKey: 'characterID',
        as: 'character'
      });
      Card.belongsTo(models.User, {
        foreignKey: 'ownerID',
        key: 'userId',
        as: 'owner'
      });
    }
  }
  Card.init({
    ownerID: DataTypes.STRING,
    identifier: DataTypes.STRING,
    characterID: DataTypes.INTEGER,
    enabled:  { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Card',
  });
  return Card;
};