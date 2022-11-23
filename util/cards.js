const { customAlphabet } = require("nanoid");
const { Card, Character } = require("../models");
const { QUALITY_SYMBOLS } = require("../config/constants");

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
    },

    getShortString: function(card) {
        return `[\`${card.identifier}\`] ${QUALITY_SYMBOLS[card.quality]} ${card.Character.name} (${card.printNr})`;
    }
}
