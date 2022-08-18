const { SlashCommandBuilder, ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { customAlphabet } = require("nanoid");
const { Card, User, Character } = require("../models");
const Util = require("../util/cards");

module.exports = {
    data: new SlashCommandBuilder()
            .setName("debug")
            .setDescription("debug feature")
            .addStringOption((option) =>
                option
                    .setName("feature")
                    .setDescription("The command to debug")
                    .setRequired(false)
                ),

    async execute(interaction) {
        const identifier = Util.generateIdentifier();
        
        switch (interaction.options.getString("feature")) {
        case "ping":
            interaction.reply({
                content: "Pong!",
                ephemeral: true
            });
            break;
        case "ids":
            const nanoid = customAlphabet('6789BCDFGHJKLMNPQRTW',6);
            const ids = [];
            for (let i = 0; i < 100; i++) {
                console.log(nanoid());
                ids.push(nanoid());
            }
            interaction.reply({
                content: `${JSON.stringify(ids)}`,
                ephemeral: false
            });
            break;
        case "clear_cards":
            const cards = await Card.findAll();
            for (let i = 0; i < cards.length; i++) {
                await cards[i].destroy();
            }
            interaction.reply({
                content: `Cleared ${cards.length} cards`,
                ephemeral: false
            });
        }
    }
}