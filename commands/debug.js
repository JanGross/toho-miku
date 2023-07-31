const { SlashCommandBuilder, ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { customAlphabet } = require("nanoid");
const { Card, User, Wishlist, Character } = require("../models");
const { UserUtils, CardUtils, GeneralUtils, Rendering } = require("../util");
const { PATREON } = require("../config/constants");
const stores = require("../stores");
require('dotenv').config();

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
                        { name: 'add_primary', value: 'add_primary' },
                        { name: 'add_secondary', value: 'add_secondary' },
                        { name: 'toggle_maintenance', value: 'toggle_maintenance' },
                        { name: 'store', value: 'store' },
                        { name: 'wishlist', value: 'wishlist' },
                        { name: 'rendering', value: 'rendering' },
                        { name: 'patreon', value: 'patreon' }
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
        await interaction.deferReply();
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
            interaction.editReply({
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
            interaction.editReply({
                content: `${JSON.stringify(ids)}`,
                ephemeral: false
            });
            break;
        case "clear_cards":
            if (process.env.NODE_ENV === "production") {
                interaction.editReply({
                    content: "This command is disabled in production."
                });
                return;
            }
            const cards = await Card.findAll();
            for (let i = 0; i < cards.length; i++) {
                await cards[i].destroy();
            }
            interaction.editReply({
                content: `Cleared ${cards.length} cards`,
                ephemeral: false
            });
            break;
        case "cooldowns":
            const timeouts = await UserUtils.getCooldowns(extUser);
            console.log(`UserTimeouts: ${JSON.stringify(timeouts)}`);
            let timeoutInMinutes = 0;
            interaction.editReply({
                content: `\`\`\`${JSON.stringify(timeouts, null, 2)}\`\`\` `,
                ephemeral: false
            });
            break;
        case "bot":
            let botProperties = await GeneralUtils.getBotProperty(null);
            interaction.editReply({
                content: `\`\`\`${JSON.stringify(botProperties, null, 2)}\`\`\` `,
                ephemeral: false
            });
            break;
        case "reset_cd":
            await UserUtils.setCooldown(extUser, "claim", 1);
            await UserUtils.setCooldown(extUser, "drop", 1);
            await UserUtils.setCooldown(extUser, "daily", 1);
            interaction.editReply({
                content: `Reset cooldowns for <@${extUser.discordId}>`,
                ephemeral: false
            });
            break;
        case "add_xp":
            await extUser.addExperience(interaction.options.getString("value"), `Debug command ran by ${interaction.member.displayName}`);
            interaction.editReply({
                content: `Added ${interaction.options.getString("value")} XP to <@${extUser.discordId}>`,
                ephemeral: false
            });
            break;
        case "add_primary":
            await extUser.addPrimaryCurrency(interaction.options.getString("value"), `Debug command ran by ${interaction.member.displayName}`);
            interaction.editReply({
                content: `Added ${interaction.options.getString("value")} Primary to <@${extUser.discordId}>`,
                ephemeral: false
            });
            break;
        case "add_secondary":
                await extUser.addSecondaryCurrency(interaction.options.getString("value"), `Debug command ran by ${interaction.member.displayName}`);
                interaction.editReply({
                    content: `Added ${interaction.options.getString("value")} Secondary to <@${extUser.discordId}>`,
                    ephemeral: false
                });
                break;
        case "toggle_maintenance":
            let maintenance = await GeneralUtils.getBotProperty("maintenance");
            await GeneralUtils.setBotProperty("maintenance", !maintenance);
            interaction.editReply({
                content: `Maintenance mode is now ${!maintenance}`,
                ephemeral: false
            });
            break;
        case "store":
            interaction.editReply({
                content: `${JSON.stringify(stores)}`,
                ephemeral: false
            });
            break;
        case "wishlist":
            let wishlists = await Wishlist.findAll({
                attributes: ['id', 'UserId'],
                include: [{
                    model: Character,
                    attributes: ['id'],
                    where: { id: interaction.options.getString("value") },
                },
                {
                    model: User,
                    attributes: ['discordId']
                }]
            });
            await interaction.editReply({
                content: `${JSON.stringify(wishlists)}`,
                ephemeral: false
            });
            break;
        case "patreon":
            interaction.editReply({
                content: `${JSON.stringify(extUser ? extUser : user)}`,
                ephemeral: false
            });
            
            let patreon = await UserUtils.getPatreonPerks(interaction.client, extUser ? extUser : user);
            interaction.channel.send(JSON.stringify(patreon));
            break;
        case "rendering":
            const row = new ActionRowBuilder();
            row.addComponents(
				new ButtonBuilder()
					.setCustomId(`testbatch`)
					.setLabel(`Render test batch`)
					.setStyle(ButtonStyle.Primary),
			);
            interaction.editReply({
                content: `Jose endpoint: ${process.env.JOSE_ENDPOINT}\n Asset URL: ${process.env.ASSET_URL}`,
                components: [row],
                ephemeral: false
            });
            const filter = (m) => m.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter: filter, componentType: ComponentType.Button, time: 60000 });
            collector.on('collect', async (i) => {
                switch (i.customId) {
                    case 'testbatch':
                        i.deferUpdate();
                        interaction.channel.send("Beep boop test batch of 5");
                        let testCard = await Card.build({
                            characterId: 0,
                            userId: 1,
                            identifier: "0xffff",
                            quality: 1,
                            printNr: 0,
                            
                        });
                        let testCharacter = Character.build({
                            id: 0,
                            groupId: 0,
                            name: "test",
                            imageIdentifier: "azur-lane/akashi.png",
                            enabled: true
                        })
                        for (let index = 0; index < 5; index++) {
                            testCard.printNr = index;
                            let render = await Rendering.renderCard(testCard, testCharacter).catch(function(error){interaction.channel.send(JSON.stringify(error))});
                            await interaction.channel.send(render);
                        }
                        break;
                }
            });

            break;
        default:
            interaction.editReply({
                content: `Your permission level is ${await UserUtils.getPermissionLevel(interaction.member)}`,
                ephemeral: false
            });
            break;
        }
    }
}