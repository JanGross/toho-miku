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
      Character.belongsTo(models.Group, { foreignKey: 'groupId', });
      // A character can belong to many badges
      Character.belongsToMany(models.Badge, { through: 'BadgeCharacter' });
      Character.hasMany(models.Card, { foreignKey: 'characterId' });
    }
  }
  Character.init({
    name: DataTypes.STRING,
    groupId: DataTypes.INTEGER,
    imageIdentifier: DataTypes.STRING,
    description: DataTypes.TEXT,
    enabled: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Character',
  });
  return Character;
};