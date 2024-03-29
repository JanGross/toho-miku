'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Groups', [{
      id: 1,
      name: 'TEST-GROUP',
      description: 'Test-Group (stylized as TEST-GROUP) is an all girl rock band from Tokyo that formed in July 2013. The band combines a rock sound with a maid image modeled on Japanese maid cafés.',
      imageURL: 'https://cdn.discordapp.com/attachments/851543504831119380/1009467684490063892/unknown.png',
      enabled: true
    }]);
    await queryInterface.bulkInsert('Characters', [{
      id: 1,
      groupId: 1,
      name: 'Group Member 1',
      description: 'Band Member 1 is a Japanese singer, songwriter and guitarist. She is the initial founding member and main lyricist for TEST-BAND.',
      imageIdentifier: 'testband/miku.png',
      enabled: true
    },
    {
      id: 2,
      groupId: 1,
      name: 'Group Member 2',
      description: 'Band Member 2 is a Japanese drummer and founding member of TEST-BAND',
      imageIdentifier: 'testband/akane.png',
      enabled: true
    }]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
