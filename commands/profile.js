require("dotenv").config();
const { SlashCommandBuilder, MessageAttachment, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Card, User, Character } = require("../models");
const { UserUtils, Compositing, Rendering } = require("../util");
const axios = require("axios");
const sharp = require("sharp");
const { CURRENCY_NAMES } = require("../config/constants");
const fs = require('fs');

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

        let customStatus = this.encodeStr(profile.customStatus);
        customStatus = customStatus.replace(/(.{0,40}[\s])/g, '<tspan x="443" dy="1.2em">$1</tspan>');
          
        let profileTemplate = fs.readFileSync('/app/assets/profile/profile.svg').toString();
        profileTemplate = profileTemplate.replace(/{{USERNAME}}/g, this.encodeStr(discordUser.username.substr(0,15)+(discordUser.username.length>15?'...':'')));
        profileTemplate = profileTemplate.replace(/{{PROFILE_TEXT}}/g, customStatus );
        profileTemplate = profileTemplate.replace(/{{HEADER_COLOR}}/g, '190,31,97');
        profileTemplate = profileTemplate.replace(/{{CC}}/g, await Card.count({where: {userId: user.id}}));
        profileTemplate = profileTemplate.replace(/{{LVL}}/g, await user.level().currentLevel);
        profileTemplate = profileTemplate.replace(/{{CUR_1}}/g, `${await user.primaryCurrency} ${CURRENCY_NAMES[1]}`);
        profileTemplate = profileTemplate.replace(/{{CUR_2}}/g, `${await user.secondaryCurrency} ${CURRENCY_NAMES[2]}`);

        let userImageBuffer = await axios.get(discordUser.displayAvatarURL({format: 'png', size: 128}), { responseType: 'arraybuffer' });
        userImage = await sharp(userImageBuffer.data);
        const rect = new Buffer.from(
            '<svg><rect x="0" y="0" width="128" height="128" rx="100%" ry="100%"/></svg>'
        );
        userImage = await userImage.composite([{input: rect, blend: 'dest-in' }]).png().toBuffer();

        let background = await sharp(Buffer.from(profileTemplate, 'utf8'))
            .composite([{ input: userImage, left: 360, top: 20 }]).png().toBuffer();

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
                    "x": 350,
                    "y": 300,
                    "width": 150,
                    "height": 250
                },
                { 
                    "type": "image",
                    "asset": `${renderedCards[2]}`,
                    "x": 510,
                    "y": 300,
                    "width": 150,
                    "height": 250
                },
                { 
                    "type": "image",
                    "asset": `${renderedCards[3]}`,
                    "x": 670,
                    "y": 300,
                    "width": 150,
                    "height": 250
                },
                {
                    "type": "text",
                    "text": this.encodeStr(discordUser.username.substr(0,15)+(discordUser.username.length>15?'...':'')),
                    "fontSize": 30,
                    "x": 25,
                    "y": 25,
                    "width": 300,
                    "height": 30,
                    "horizontalAlignment": "center"
                }
            ]
        }
        
        console.log("Fetching ", );
        let { data } = await axios.post(`${process.env.JOSE_ENDPOINT}/jobs`, job);
        console.log("Fetched ", data);
        await interaction.editReply({ files: [data["path"]] });
    },
    encodeStr: function(str) {
        let charMapping = {
            '&': '&amp;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;'
        };
        return str.replace(/([\&"<>])/g, function(str, item) {
            return charMapping[item];
        });
    }
}