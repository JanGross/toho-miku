'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Bots', 'pullTimeout', 'claimTimeout');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Bots', 'claimTimeout', 'pullTimeout');
  }
};
