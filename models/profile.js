'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Profile.belongsTo(models.User, { foreignKey: 'userId' });
      Profile.belongsTo(models.Card, { foreignKey: 'slotOne' });
      Profile.belongsTo(models.Card, { foreignKey: 'slotTwo' });
      Profile.belongsTo(models.Card, { foreignKey: 'slotThree' });
      Profile.belongsTo(models.Card, { foreignKey: 'slotFour' });
    }
  }
  Profile.init({
    userId: DataTypes.INTEGER,
    customStatus: DataTypes.STRING,
    customBackground: DataTypes.STRING,
    slotOne: DataTypes.INTEGER,
    slotTwo: DataTypes.INTEGER,
    slotThree: DataTypes.INTEGER,
    slotFour: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Profile',
  });
  return Profile;
};