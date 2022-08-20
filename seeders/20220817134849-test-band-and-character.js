'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('Bands', [{
      id: 1,
      name: 'BAND-MAID',
      description: 'Band-Maid (stylized as BAND-MAID) is an all girl rock band from Tokyo that formed in July 2013. The band combines a rock sound with a maid image modeled on Japanese maid cafés.',
      imageURL: 'https://cdn.discordapp.com/attachments/851543504831119380/1009467684490063892/unknown.png',
      enabled: true
    }]);
    await queryInterface.bulkInsert('Characters', [{
      id: 1,
      bandId: 1,
      name: 'Miku Kobato',
      description: 'Miku Kobato is a Japanese singer, songwriter and guitarist. She is the initial founding member and main lyricist for BAND-MAID.',
      imageIdentifier: 'bandmaid/miku.png',
      enabled: true
    },
    {
      id: 2,
      bandId: 1,
      name: 'Akane Hirose',
      description: 'Akane Hirose is a Japanese drummer and founding member of BAND-MAID.',
      imageIdentifier: 'bandmaid/akane.png',
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
