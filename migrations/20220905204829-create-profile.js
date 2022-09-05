'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Profiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
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
      customStatus: {
        type: Sequelize.STRING,
        allowNull: true
      },
      slotOne: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Cards',
          key: 'id'
        }
      },
      slotTwo: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Cards',
          key: 'id'
        }
      },
      slotThree: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Cards',
          key: 'id'
        }
      },
      slotFour: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Cards',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Profiles');
  }
};