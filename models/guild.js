'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Guild extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Guild.init({
    guildId: DataTypes.BIGINT,
    adminRoleId: DataTypes.BIGINT,
    active: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Guild',
  });
  return Guild;
};