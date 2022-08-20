const sharp = require('sharp');
const { Character } = require('../models');

module.exports = {
    name: "Rendering",
    renderCardStack: async function(cards) {
        for (let card of cards) {
            const character = await Character.findOne({
                where: {
                    id: card.characterId
                }
            });
            card.imageIdentifier = card.userId ? character.imageIdentifier : 'card_cover.png';

            const cardImage = await sharp(`./assets/cards/${card.imageIdentifier}`);
            if (card.userId === 1) {
                cardImage.grayscale()
                .modulate({
                    brightness: 0.5
                });
            }
            card.preProcessed = await cardImage.png().toBuffer();
        }
        
        const image = await sharp({
            create: {
            width: 900,
            height: 500,
            channels: 4,
            background: { r: 255, g: 0, b: 0, alpha: 0.5 }
            }
         })
        .composite([
            { input: cards[0].preProcessed, gravity: 'northwest' },
            { input: cards[1].preProcessed, gravity: 'centre' },
            { input: cards[2].preProcessed, gravity: 'northeast' },
            { input: './assets/overlays/rainbow_overlay.png', gravity: 'northwest' },
            { input: './assets/overlays/rainbow_overlay.png', gravity: 'centre' },
            { input: './assets/overlays/rainbow_overlay.png', gravity: 'northeast' },
        ])
        .png()
        .toBuffer();

        return image;
    }
}
