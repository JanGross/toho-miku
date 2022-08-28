const sharp = require('sharp');
const crypto = require('crypto');
const fs = require('fs');
const { Character } = require('../models');

const QualityColors = {
    1: {r: 0, g: 0, b: 0}, //bad
    2: {r: 150, g: 150, b: 50}, //ok
    3: {r: 0, g: 255, b: 0}, //good
    4: {r: 0, g: 255, b: 255}, //great
    5: {r: 0, g: 0, b: 255}, //epic
    6: {r: 255, g: 255, b: 0} //shiny
}

//TODO: Handle missing images
module.exports = {
    name: "Rendering",
    renderCardStack: async function(cards) {

        for (let card of cards) {
            console.log(`Iterating card ${card.id}`);
            card['render'] = await this.renderCard(card);
        }
        
        let image = await sharp({
            create: {
                width: 900,
                height: 500,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0.0 },
                animated: true
            }
         }).composite([
            { input: cards[0].render, gravity: 'northwest' },
            { input: cards[1].render, gravity: 'centre' },
            { input: cards[2].render, gravity: 'northeast' },
        ]); 

        let hash = crypto.createHash('md5').update("CHANGEME").digest('hex');
        try {
            await image.gif({effort: 1}).toFile(`./assets/image_cache/${hash}.gif`);            
        } catch (error) {
            console.log(error);
        }

        return `./assets/image_cache/${hash}.gif`;

    },
    renderCard: async function(card) {
        const character = await Character.findOne({
            where: {
                id: card.characterId
            }
        });

        if (!card.userId) {
            return './assets/cards/card_cover.png';
        }

        let hash = crypto.createHash('md5').update(character.imageIdentifier + card.quality + (card.userId == 1 ? 'unclaimed' : 'claimed')).digest('hex');
        //TODO: Add switch to turn off or bypass caching
        if (fs.existsSync(`./assets/image_cache/${hash}.gif`)) {
            return `./assets/image_cache/${hash}.gif`;
        }

        console.log(`Rendering card ${hash}`);

        let border = await sharp(`./assets/overlays/border.svg`).tint(QualityColors[card.quality]).toBuffer();
        //BUGBUG: Custom fonts not loading
        let label = Buffer.from(`
        <svg width="300" height="500">
            <text x="50%" y="95%" text-anchor="middle" style="font-size:28px;">${character.name}</text>
        </svg>
        `);

        const cardImage = await sharp(`./assets/cards/${character.imageIdentifier}`, { animated: true, pages: -1 });
        await cardImage.resize(300, 500);
        await cardImage.composite([
            {input: border, top:0, left: 0, tile: true},
            {input: label, top:0, left: 0, tile: true}]);
        //BUGBUG: Grayscale does not apply to card border
        if (card.userId === 1) {
            await cardImage.grayscale()
            .modulate({
                brightness: 0.5
            });
        }
        await cardImage.gif({effort: 1}).toFile(`./assets/image_cache/${hash}.gif`);

        return `./assets/image_cache/${hash}.gif`;
    }
}
