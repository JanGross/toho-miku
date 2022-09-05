'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Card);
    }
    //instance methods
    async getCardsWithCharactersCounted() {
      let cards = await sequelize.models.Card.findAndCountAll({
          where: {
              userId: this.id
          },
          include: [{
              model: sequelize.models.Character,
          }]
      });
      return cards;
    }
  }
  User.init({
    discordId: DataTypes.BIGINT,
    active: DataTypes.INTEGER,
    privacy: DataTypes.INTEGER,
    nextDrop: DataTypes.DATE,
    nextPull: DataTypes.DATE,
    nextDaily: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};