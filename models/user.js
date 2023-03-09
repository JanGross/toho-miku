'use strict';
const {
  Model
} = require('sequelize');

const levelModifier = 0.5;

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
      User.hasMany(models.CurrencyHistory);
      User.hasOne(models.Profile);
      // A user can have many badges
      User.belongsToMany(models.Badge, { through: 'BadgeUser' });
    }
    async addExperience(amount, source='unknown') {
      console.log(`Adding ${amount} experience to user ${this.id}`);
      await sequelize.models.CurrencyHistory.create({
        userId: this.id,
        currency: 0,
        delta: amount,
        previous: this.experience,
        source: source
      });
      await this.update({
          experience: this.experience + parseInt(amount)
      });
    }
    async addCurrency(amount, type, source='unknown') {
      let typeStr = '';
      if (type == 1) {
        typeStr = `primaryCurrency`;
      }
      if (type == 2) {
        typeStr = `secondaryCurrency`;
      }
      console.log(`Adding ${amount} ${typeStr} to user ${this.id}`);
      await sequelize.models.CurrencyHistory.create({
        userId: this.id,
        currency: type,
        delta: amount,
        previous: this[typeStr],
        source: source
      });
      this[typeStr] += parseInt(amount);
      await this.save();
    }
    async addPrimaryCurrency(amount, source='unknown') {
      return await this.addCurrency(amount, 1, source);
    }
    async addSecondaryCurrency(amount, source='unknown') {
      return await this.addCurrency(amount, 2, source);
    }
    level() {
      let currentLevel = Math.floor(levelModifier * Math.sqrt(this.experience));
      let nextLevelExperience = Math.pow((currentLevel + 1) / levelModifier, 2);
      let remaining = nextLevelExperience - this.experience;
      return {
          currentLevel: currentLevel,
          currentExperience: this.experience,
          nextLevelExperience: nextLevelExperience,
          remaining: remaining
      };
    }
    async cards() {
      return await sequelize.models.Card.findAndCountAll({
        where: {
          userId: this.id
        }
      });
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
    primaryCurrency: DataTypes.INTEGER,
    secondaryCurrency: DataTypes.INTEGER,
    remainingDrops: DataTypes.INTEGER,
    remainingClaims: DataTypes.INTEGER,
    nextDropReset: DataTypes.DATE,
    nextClaimReset: DataTypes.DATE,
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