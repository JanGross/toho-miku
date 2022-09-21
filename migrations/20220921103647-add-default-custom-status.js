'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    let defaultStatus = "Hello, I'm new here!";
    //Replace existin null values with default
    await queryInterface.sequelize.query(`UPDATE Profiles SET customStatus = "${defaultStatus}" WHERE customStatus IS NULL`);
    //Update column defaults
    await queryInterface.changeColumn('Profiles', 'customStatus', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: defaultStatus
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn('Profiles', 'customStatus', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });
  }
};
