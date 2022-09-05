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
      Card.belongsTo(models.User);
      Card.belongsTo(models.Character);
    }
  }
  Card.init({
    identifier: DataTypes.STRING,
    characterId: DataTypes.INTEGER,
    quality: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    imageHash: DataTypes.STRING,
    enabled:  { type: DataTypes.BOOLEAN, defaultValue: true },
    printNr: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Card',
  });
  return Card;
};