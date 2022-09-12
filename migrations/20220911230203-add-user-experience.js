'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add field experience to table users
     */
    await queryInterface.addColumn('Users', 'experience', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Remove field experience from table users
     */
    await queryInterface.removeColumn('Users', 'experience');
  }
};
