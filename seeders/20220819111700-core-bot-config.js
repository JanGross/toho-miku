'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Bots', [{
      id: 1,
      maintenance: 0,
      adminIDs: '["222457277708369928"]',
      pullTimeout: 300000,
      dropTimeout: 900000
    }]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Bots', null, {});
  }
};
