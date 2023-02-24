'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameTable('Bands', 'Groups');
    await queryInterface.renameColumn('Characters', 'bandId', 'groupId');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('Characters', 'groupId', 'bandId');
    await queryInterface.renameTable('Groups', 'Bands');
  }
};
