'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Characters', 'imageURL', 'imageIdentifier');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Characters', 'imageIdentifier', 'imageURL');
  }
};
