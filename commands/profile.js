const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Card, User, Character } = require("../models");
const { UserUtils, Compositing, Rendering } = require("../util");
const fs = require('fs');

const pageSize = 8;

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("profile")
            .setDescription("View your profile"),
    async execute(interaction) {
        await interaction.deferReply();
        let user = await UserUtils.getUserByDiscordId(interaction.member.id);

        let profile = await user.getProfile();

        let profileTemplate = fs.readFileSync('/app/assets/profile/profile.svg').toString();
        profileTemplate = profileTemplate.replace(/{{USERNAME}}/g, interaction.member.user.username);
        profileTemplate = profileTemplate.replace(/{{HEADER_COLOR}}/g, '190,31,97');

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

        let profileImage = await Compositing.renderProfile(profile, profileTemplate, renderedCards);
        await interaction.editReply({ files: [profileImage] });
    }
}