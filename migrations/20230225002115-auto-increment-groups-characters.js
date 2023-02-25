'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;")
    await queryInterface.sequelize.query("ALTER TABLE `Groups` AUTO_INCREMENT=999999999;")
    await queryInterface.sequelize.query("ALTER TABLE Characters AUTO_INCREMENT=999999999;")
    await queryInterface.sequelize.query("ALTER TABLE `Groups` MODIFY id INT NOT NULL AUTO_INCREMENT;")
    await queryInterface.sequelize.query("ALTER TABLE Characters MODIFY id INT NOT NULL AUTO_INCREMENT;")
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;")
  },
  
  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;")
    await queryInterface.sequelize.query("ALTER TABLE `Groups` AUTO_INCREMENT=1;")
    await queryInterface.sequelize.query("ALTER TABLE Characters AUTO_INCREMENT=1;")
    await queryInterface.sequelize.query("ALTER TABLE `Groups` MODIFY id INT NOT NULL;")
    await queryInterface.sequelize.query("ALTER TABLE Characters MODIFY id INT NOT NULL;")
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;")
  }
};
