require("dotenv").config();
const { SlashCommandBuilder } = require("discord.js");
const { Card } = require("../models");
const { UserUtils, Rendering } = require("../util");
const axios = require("axios");
const { CURRENCY_NAMES } = require("../config/constants");

const pageSize = 8;

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("profile")
            .setDescription("View your profile")
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription("View someone else's profile")
                    .setRequired(false)
                ),
    permissionLevel: 0,
    async execute(interaction) {
        await interaction.reply({ files:[ 'https://cdn.discordapp.com/attachments/856904078754971658/1019009533470842930/rendering-placeholder.gif']});

        let discordUser = interaction.options.getUser("user") ? interaction.options.getUser("user") : interaction.member.user;
        let user = await UserUtils.getUserByDiscordId(discordUser.id);

        let profile = await user.getProfile();

        let customStatus = profile.customStatus;
          
        let userImage = discordUser.displayAvatarURL({format: 'png', size: 128}).split('webp')[0] + 'png';

        let slots = ['slotOne', 'slotTwo', 'slotThree', 'slotFour'];
        let renderedCards = [];
        await Promise.all(slots.map(async slot => {
            let card = await Card.findOne({ where: { id: profile[slot], burned: false } });
            if (card) {
                console.log(`Iterating card ${card.id}`);
                let cardImage = await Rendering.renderCard(card);
                renderedCards.push(cardImage);
            } else {
                renderedCards.push(`${process.env.ASSET_URL}/cards/card_cover.png`);
            }
        }));

        let job = {
            "type": "profile",
            "size": {
                "width": 1200,
                "height": 600
            },
            "elements": [
                { 
                    "type": "image",
                    "asset": `${renderedCards[0]}`,
                    "x": 25,
                    "y": 85,
                    "width": 300,
                    "height": 500
                },
                { 
                    "type": "image",
                    "asset": `${renderedCards[1]}`,
                    "x": 375,
                    "y": 310,
                    "width": 175,
                    "height": 275
                },
                { 
                    "type": "image",
                    "asset": `${renderedCards[2]}`,
                    "x": 560,
                    "y": 310,
                    "width": 175,
                    "height": 275
                },
                { 
                    "type": "image",
                    "asset": `${renderedCards[3]}`,
                    "x": 745,
                    "y": 310,
                    "width": 175,
                    "height": 275
                },
                { 
                    "type": "image",
                    "asset": userImage,
                    "x": 350,
                    "y": 50,
                    "width": 150,
                    "height": 150
                },
                {
                    "type": "text",
                    "text": discordUser.username.substr(0,15)+(discordUser.username.length>15?'...':''),
                    "fontSize": 32,
                    "x": 25,
                    "y": 20,
                    "width": 300,
                    "height": 30,
                    "horizontalAlignment": "center"
                },
                {
                    "type": "text",
                    "text": `CC: ${await Card.count({where: {userId: user.id}})}`,
                    "fontSize": 30,
                    "x": 550,
                    "y": 20,
                    "width": 150,
                    "height": 30,
                    "horizontalAlignment": "left"
                },
                {
                    "type": "text",
                    "text": `LVL: ${await user.level().currentLevel}`,
                    "fontSize": 30,
                    "x": 700,
                    "y": 20,
                    "width": 150,
                    "height": 30,
                    "horizontalAlignment": "left"
                },
                {
                    "type": "text",
                    "text": `${await user.primaryCurrency} ${CURRENCY_NAMES[1]}`,
                    "fontSize": 30,
                    "x": 850,
                    "y": 20,
                    "width": 150,
                    "height": 30,
                    "horizontalAlignment": "left"
                },
                {
                    "type": "text",
                    "text": `${await user.secondaryCurrency} ${CURRENCY_NAMES[2]}`,
                    "fontSize": 30,
                    "x": 1000,
                    "y": 20,
                    "width": 150,
                    "height": 30,
                    "horizontalAlignment": "left"
                },
                {
                    "type": "text",
                    "text": customStatus,
                    "fontSize": 30,
                    "x": 550,
                    "y": 55,
                    "width": 600,
                    "height": 300,
                    "horizontalAlignment": "left"
                }
            ]
        }
        
        console.log("Fetching ", );
        let { data } = await axios.post(`${process.env.JOSE_ENDPOINT}/jobs`, job);
        console.log("Fetched ", data);
        await interaction.editReply({ files: [data["path"]] });
    }
}