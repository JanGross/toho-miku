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
                    .addChoices(
                        { name: 'ping', value: 'ping' },
                        { name: 'ids', value: 'ids' },
                        { name: 'clear_cards', value: 'clear_cards' },
                        { name: 'cooldowns', value: 'cooldowns' },
                        { name: 'bot', value: 'bot' },
                        { name: 'reset_cd', value: 'reset_cd' },
                        { name: 'add_xp', value: 'add_xp' },
                    )
                )
            .addStringOption((option) =>
                option
                    .setName("userid")
                    .setDescription("Discord ID")
                    .setRequired(false)
                )
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription("Discord User")
                    .setRequired(false)
                )
            .addStringOption((option) =>
                option
                    .setName("value")
                    .setDescription("some value")
                    .setRequired(false)
                ),
    permissionLevel: 2,
    async execute(interaction) {
        const identifier = CardUtils.generateIdentifier();
        let user = await UserUtils.getUserByDiscordId(interaction.member.id);
        let extUser;
        if(interaction.options.getUser("user")) {
            extUser = await UserUtils.getUserByDiscordId(interaction.options.getUser("user").id);
        } else if(interaction.options.getString("userid")) {
            extUser = await UserUtils.getUserByDiscordId(interaction.options.getString("userid"));
        }
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
            await UserUtils.setCooldown(extUser, "pull", 1);
            await UserUtils.setCooldown(extUser, "drop", 1);
            await UserUtils.setCooldown(extUser, "daily", 1);
            interaction.reply({
                content: `Reset cooldowns for <@${extUser.discordId}>`,
                ephemeral: false
            });
            break;
        case "add_xp":
            await extUser.addExperience(interaction.options.getString("value"))
            interaction.reply({
                content: `Added ${interaction.options.getString("value")} XP to <@${extUser.discordId}>`,
                ephemeral: false
            });
            break;
        default:
            interaction.reply({
                content: `Your permission level is ${await UserUtils.getPermissionLevel(interaction.member)}`,
                ephemeral: false
            });
            break;
        }
    }
}