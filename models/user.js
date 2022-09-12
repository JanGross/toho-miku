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
      User.hasOne(models.Profile);
    }
    async addExperience(amount) {
      console.log(`Adding ${amount} experience to user ${this.id}`);
      await this.update({
          experience: this.experience + parseInt(amount)
      });
    }
    async getLevel() {
      return Math.ceil(0.5 * Math.sqrt(this.experience));
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
    async getProfile() {
      return await sequelize.models.Profile.findOne({
          where: {
              userId: this.id
          }
      });
    }
  }
  User.init({
    discordId: DataTypes.BIGINT,
    active: DataTypes.INTEGER,
    privacy: DataTypes.INTEGER,
    experience: DataTypes.INTEGER,
    nextDrop: DataTypes.DATE,
    nextPull: DataTypes.DATE,
    nextDaily: DataTypes.DATE
  }, {
    hooks: {
      afterCreate: async (user, options) => {
        //Create new user profile
        await sequelize.models.Profile.create({
          userId: user.id
        });
      }
    },
    sequelize,
    modelName: 'User',
  });
  return User;
};