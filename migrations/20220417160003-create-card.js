'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Cards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      identifier: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true
      },
      characterId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Characters',
          key: 'id'
        }
      },
      quality: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      imageHash: {
        type: Sequelize.STRING
      },
      enabled: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      printNr: {
        allowNull: false,
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('Cards');
  }
};