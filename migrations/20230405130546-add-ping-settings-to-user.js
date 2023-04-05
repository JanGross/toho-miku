'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'wishlistPing', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('Users', 'dropPing', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('Users', 'dailyPing', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'wishlistPing');
    await queryInterface.removeColumn('Users', 'dropPing');
    await queryInterface.removeColumn('Users', 'dailyPing');
  }
};
