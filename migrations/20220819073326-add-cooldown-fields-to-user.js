'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'nextDrop', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
    await queryInterface.addColumn('Users', 'nextPull', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
    await queryInterface.addColumn('Users', 'nextDaily', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
    await queryInterface.addColumn('Bots', 'pullTimeout', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 300000 // 5 minutes
    });
    await queryInterface.addColumn('Bots', 'dropTimeout', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 900000 // 15 minutes
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'nextDrop');
    await queryInterface.removeColumn('Users', 'nextPull');
    await queryInterface.removeColumn('Users', 'nextDaily');
    await queryInterface.removeColumn('Bots', 'pullTimeout');
    await queryInterface.removeColumn('Bots', 'dropTimeout');
  }
};
