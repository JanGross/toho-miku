const { SlashCommandBuilder, MessageAttachment, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Card, User, Character } = require("../models");
const { UserUtils, Compositing, Rendering } = require("../util");
const axios = require("axios");
const sharp = require("sharp");
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
    async execute(interaction) {
        await interaction.reply({ files:[ 'https://cdn.discordapp.com/attachments/856904078754971658/1019009533470842930/rendering-placeholder.gif']});

        let discordUser = interaction.options.getUser("user") ? interaction.options.getUser("user") : interaction.member.user;
        let user = await UserUtils.getUserByDiscordId(discordUser.id);

        let profile = await user.getProfile();

        let customStatus = profile.customStatus ? profile.customStatus : "A Band Bot user";
        
        customStatus = customStatus.replace(/(.{0,40}[\s])/g, '<tspan x="443" dy="1.2em">$1</tspan>');

        let profileTemplate = fs.readFileSync('/app/assets/profile/profile.svg').toString();
        profileTemplate = profileTemplate.replace(/{{USERNAME}}/g, discordUser.username.substr(0,15)+(discordUser.username.length>15?'...':''));
        profileTemplate = profileTemplate.replace(/{{PROFILE_TEXT}}/g, customStatus );
        profileTemplate = profileTemplate.replace(/{{HEADER_COLOR}}/g, '190,31,97');
        profileTemplate = profileTemplate.replace(/{{CC}}/g, await Card.count({where: {userId: user.id}}));
        profileTemplate = profileTemplate.replace(/{{LVL}}/g, await user.level().currentLevel);

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
        for (slot of slots) {
            let card = await Card.findOne({ where: { id: profile[slot] }});
            if (card) {
                let cardImage = await Rendering.renderCard(card);
                renderedCards.push(cardImage);
            } else {
                renderedCards.push('/app/assets/cards/missing_image.png');
            }

        }

        let profileImage = await Compositing.renderProfile(profile, background, renderedCards);
        await interaction.editReply({ files: [profileImage] });
    }
}