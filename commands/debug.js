const { SlashCommandBuilder, ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { customAlphabet } = require("nanoid");
const { Card, User } = require("../models");
const { UserUtils, CardUtils, GeneralUtils } = require("../util");

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
        const identifier = CardUtils.generateIdentifier();
        let user = await UserUtils.getUserByDiscordId(interaction.member.id);
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
            break;
        case "cooldowns":
            const timeouts = await UserUtils.getCooldowns(user);
            console.log(`UserTimeouts: ${JSON.stringify(timeouts)}`);
            let timeoutInMinutes = 0;
            interaction.reply({
                content: `\`\`\`${JSON.stringify(timeouts, null, 2)}\`\`\` `,
                ephemeral: false
            });
            break;
        case "bot":
            let botProperties = await GeneralUtils.getBotProperty(null);
            interaction.reply({
                content: `\`\`\`${JSON.stringify(botProperties, null, 2)}\`\`\` `,
                ephemeral: false
            });
            break;
        case "reset_cd":
            await UserUtils.setCooldown(user, "pull", 1);
            await UserUtils.setCooldown(user, "drop", 1);
            await UserUtils.setCooldown(user, "daily", 1);
            interaction.reply({
                content: `Reset cooldowns`,
                ephemeral: false
            });
        }
    }
}