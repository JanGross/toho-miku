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
      Character.belongsTo(models.Band, { foreignKey: 'bandId', });
    }
  }
  Character.init({
    name: DataTypes.STRING,
    bandId: DataTypes.INTEGER,
    imageURL: DataTypes.STRING,
    description: DataTypes.TEXT,
    enabled: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Character',
  });
  return Character;
};