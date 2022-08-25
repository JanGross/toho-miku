const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { Card, User, Character } = require("../models");
const Rendering = require("../util/rendering");

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("view")
            .setDescription("View a specific card")
            .addStringOption((option) =>
                option
                    .setName("card")
                    .setDescription("Card identifier")
                    .setRequired(false)
                ),
    async execute(interaction) {
        await interaction.deferReply();
        const cardId = interaction.options.getString('card');
        const card = await Card.findOne({
            where: {
                identifier: cardId
            },
            include: [Character]
        });
        if (!card) {
            interaction.reply({
                content: "Card not found",
                ephemeral: true
            });
            return;
        }
        
        let cardImage = await Rendering.renderCard(card);
        const message = await interaction.editReply({ content: '', files: [new AttachmentBuilder(cardImage, { name: 'card.gif' })], fetchReply: true });
                
    }
}