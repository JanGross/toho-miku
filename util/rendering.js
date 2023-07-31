require("dotenv").config();
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
    renderCard: async function(card, character=null) {
        if(!character) {
            character = await Character.findOne({
                where: {
                    id: card.characterId
                }
            });
        }

        console.log(`Rendering card ${card.id} ${character.name} ${character.imageIdentifier}`);
        
        let characterImage = `${process.env.ASSET_URL}/cards/${character.imageIdentifier}`;

        //Hide character info if the card is unclaimed
        if (!card.userId) {
            characterImage = `${process.env.ASSET_URL}/cards/card_cover.png`;
            character.name = ' ';
        }

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
                    "y": 850,
                    "width": 600,
                    "height": 300,
                    "horizontalAlignment": "center"
                }
            ]
        }

        if(process.env.NODE_ENV === "development") {
            debugElement = {
                "type": "text",
                "text": `Jose-Endpoint: ${process.env.JOSE_ENDPOINT}\nNode: %nodeid% \nPrint: ${card.printNr} uid: ${card.identifier}\n Serve-Mode: %servemode%`,
                "fontSize": 25,
                "x": 0,
                "y": 50,
                "width": 600,
                "height": 800,
                "horizontalAlignment": "center"
            }
            job.elements.push(debugElement)
        }
        
        console.log("Fetching ", JSON.stringify(job));
        let { data } = await axios.post(`${process.env.JOSE_ENDPOINT}/jobs`, job);
        console.log("Fetched ", JSON.stringify(data));
        return data["path"];
    }
}
