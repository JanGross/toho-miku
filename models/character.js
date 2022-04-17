'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Character extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Character.hasMany(models.Card, {
        foreignKey: 'characterID',
        as: 'cards'
      });
    }
  }
  Character.init({
    name: DataTypes.STRING,
    rarity: DataTypes.INTEGER,
    description: DataTypes.STRING,
    imageURL: DataTypes.STRING,
    imageHash: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Character',
  });
  return Character;
};