'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Badge extends Model {
    static associate(models) {
      // A badge can belong to many cards
      Badge.belongsToMany(models.Character, { through: 'BadgeCharacter' });

      // A badge can belong to many users
      Badge.belongsToMany(models.User, { through: 'BadgeUser' });
    }
  }
  Badge.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Badge',
  });
  return Badge;
};