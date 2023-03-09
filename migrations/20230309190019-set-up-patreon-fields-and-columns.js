'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /** FIXME: Migration won't run with datatype DATETIME and a default value of CURRENT_TIMESTAMP
     *  these changeColumns cause the default value to be removed entirely. ? */

    await queryInterface.changeColumn('Users', 'nextDrop', {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    });
    await queryInterface.changeColumn('Users', 'nextPull', {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    });
    await queryInterface.renameColumn('Users', 'nextDrop', 'nextDropReset');
    await queryInterface.renameColumn('Users', 'nextPull', 'nextClaimReset');
    await queryInterface.addColumn('Users', 'remainingDrops', {
      type: Sequelize.INTEGER,
      defaultValue: 1
    });
    await queryInterface.addColumn('Users', 'remainingClaims', {
      type: Sequelize.INTEGER,
      defaultValue: 1
    });
    await queryInterface.addColumn('Bots', 'patreonTierRoles', {
      type: Sequelize.INTEGER,
      defaultValue: 1
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'remainingDrops');
    await queryInterface.removeColumn('Users', 'remainingClaims');
    await queryInterface.removeColumn('Users', 'patreonTierRoles');
    await queryInterface.renameColumn('Users', 'nextDropReset', 'nextDrop');
    await queryInterface.renameColumn('Users', 'nextClaimReset', 'nextPull');
  }
};
