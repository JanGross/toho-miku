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

        await Promise.all(cards.map(async card => {
            console.log(`Iterating card ${card.id}`);
            card['render'] = await this.renderCard(card);
        }));
        
        let job = {
            "type": "stack",
            "size": {
                "width": 900,
                "height": 500
            },
            "elements": [
                { 
                    "type": "image",
                    "asset": `${cards[0].render}`,
                    "x": 0,
                    "y": 0,
                    "width": 300,
                    "height": 500
                },
                { 
                    "type": "image",
                    "asset": `${cards[1].render}`,
                    "x": 300,
                    "y": 0,
                    "width": 300,
                    "height": 500
                },
                { 
                    "type": "image",
                    "asset": `${cards[2].render}`,
                    "x": 600,
                    "y": 0,
                    "width": 300,
                    "height": 500
                }
            ]
        }
        
        console.log("Fetching ", );
        let { data } = await axios.post(`${process.env.JOSE_ENDPOINT}/jobs`, job);
        console.log("Fetched ", data);
        return data["path"];

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

        //Hide character info if the card is unclaimed
        if (!card.userId) {
            characterImage = `${process.env.ASSET_URL}/cards/card_cover.png`;
            character.name = ' ';
        }

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
                    "x": 10,
                    "y": 10,
                    "width": 580,
                    "height": 980
                },
                { 
                    "type": "image",
                    "asset": `${process.env.ASSET_URL}/overlays/default_frame.png`,
                    "x": 0,
                    "y": 0,
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
                }
            ]
        }
        
        console.log("Fetching ", );
        let { data } = await axios.post(`${process.env.JOSE_ENDPOINT}/jobs`, job);
        console.log("Fetched ", data["path"]);
        return data["path"];

    }
}
