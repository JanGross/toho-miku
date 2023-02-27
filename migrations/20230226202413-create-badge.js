'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Badges', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('ALTER TABLE BadgeCharacter DROP FOREIGN KEY BadgeCharacter_ibfk_1;');
    await queryInterface.sequelize.query('ALTER TABLE BadgeCharacter DROP FOREIGN KEY BadgeCharacter_ibfk_2;');
    await queryInterface.sequelize.query('ALTER TABLE BadgeUser DROP FOREIGN KEY BadgeUser_ibfk_1;');
    await queryInterface.sequelize.query('ALTER TABLE BadgeUser DROP FOREIGN KEY BadgeUser_ibfk_2;');
    await queryInterface.dropTable('Badges');
  }
};