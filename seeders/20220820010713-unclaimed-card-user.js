'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [{
      id: 1,
      discordId: '123456789',
      active: false,
      privacy: 0,
      nextDropReset: new Date(),
      nextClaimReset: new Date(),
      nextDaily: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.delete('Users', {
      where : {
        discordId: '123456789'
      }
    });
  }
};
