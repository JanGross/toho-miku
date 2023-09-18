'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Bots', [{
      id: 1,
      maintenance: 0,
      adminIDs: '["222457277708369928"]',
      claimTimeout: 300000,
      dropTimeout: 900000,
      patreonTierRoles: '{"1083018874263453868":1,"1083018984921759744":2,"1083019067184664607":3,"1083019116111216702":4,"1084519566354423918":5}'
    }]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Bots', null, {});
  }
};
