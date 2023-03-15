'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Wishlist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        models.User.hasOne(Wishlist);
        Wishlist.belongsTo(models.User);
        Wishlist.belongsToMany(models.Character, { through: 'WishlistCharacter' });
        models.Character.belongsToMany(Wishlist, { through: 'WishlistCharacter' });
    }
  }
  Wishlist.init({
    ping: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Wishlist',
  });
  return Wishlist;
};

