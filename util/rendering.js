require("dotenv").config();
const sharp = require('sharp');
const crypto = require('crypto');
const fs = require('fs');
const { Character } = require('../models');
const axios = require('axios').default

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

/*         if (!card.userId) {
            return './assets/cards/card_cover.png';
        } */
        /**
        let hash = crypto.createHash('md5').update(character.imageIdentifier + card.quality + (card.userId == 1 ? 'unclaimed' : 'claimed')).digest('hex');
        //TODO: Add switch to turn off or bypass caching
        if (fs.existsSync(`./assets/image_cache/${hash}.gif`)) {
            return `./assets/image_cache/${hash}.gif`;
        }
        **/
        console.log(`Rendering card or character ${character.name} ${character.imageIdentifier}`);
        
        let characterImage = `${process.env.ASSET_URL}/cards/${character.imageIdentifier}`;
        console.log("Character iomage ", characterImage);
        let job = {
            "type": "card",
            "size": {
                "width": 600,
                "height": 1000
            },
            "elements": [
                { 
                    "type": "image",
                    "asset": `${characterImage}`,
                    "x": 0,
                    "y": 300,
                    "width": 600,
                    "height": 1000
                },
                {
                    "type": "text",
                    "text": `${character.name}`,
                    "fontSize": 55,
                    "x": 0,
                    "y": 700,
                    "width": 600,
                    "height": 300,
                    "horizontalAlignment": "center"
                },
                { 
                    "type": "image",
                    "asset": "https://cdn.discordapp.com/attachments/1083687175998152714/1113486254953222205/rainbow_overlay.png",
                    "x": 0,
                    "y": 300,
                    "width": 600,
                    "height": 1000
                }
            ]
        }
        
        console.log("Fetching ", );
        let { data } = await axios.post(`${process.env.JOSE_ENDPOINT}/jobs`, job);
        console.log("Fetched ", data);
        return data["path"];

    }
}
