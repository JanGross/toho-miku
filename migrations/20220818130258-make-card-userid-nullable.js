'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Cards', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Cards', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};
