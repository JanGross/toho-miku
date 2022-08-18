const { customAlphabet } = require("nanoid");
const { Card, Character } = require("../models");

module.exports = {
    name: "CardUtils",
    generateIdentifier: function() {
        const nanoid = customAlphabet('6789BCDFGHJKLMNPQRTW',6);
        return nanoid();
    },

    getNextPrintNumber: async function(characterId) {
        let count = await Card.count({
            where: {
                characterId: characterId
            }
        });
        return count + 1;
    },

    getCharacterCount: async function(characterId) {
        return await Character.count();
    }
}
