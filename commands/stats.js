const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { UserUtils } = require('../util');
const { CURRENCY_SYMBOLS, QUALITY_NAMES } = require('../config/constants');
module.exports = {
    data: new SlashCommandBuilder()
            .setName("stats")
            .setDescription("View user Stats")
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription("View someone else's stats")
                    .setRequired(false)
                ),
    async execute(interaction) {
        await interaction.deferReply();
        let discordUser = interaction.options.getUser("user") ? interaction.options.getUser("user") : interaction.member.user;
        let user = await UserUtils.getUserByDiscordId(discordUser.id);
        
        let level = await user.level();
        let registrationDate = new Date(user.createdAt).toLocaleString('en-GB', { timeZone: 'UTC' });
        let userCards = await user.cards();

        let qualityCount = Array(6).fill(0);
        let qualities = Object.values(QUALITY_NAMES);
        let totalCards = 0;
        let burnedCards = 0;

        for (card of userCards.rows) {
            if (card.burned) {
                burnedCards++;
                continue;
            }
            totalCards++;
            qualityCount[card.quality-1]++;
        }

        for (let i = 0; i < qualities.length; i++) {
            qualities[i] = `${qualities[i]}: ${qualityCount[i]}`;
        }

        let embed = new EmbedBuilder()
            .setTitle(`${discordUser.username}'s Stats`)
            .addFields(
                { name: "Cards owned", value: `${qualities.join('\n')}\n${totalCards} total - ${burnedCards} burned`, inline: true },
                { name: "Level", value: `${level.currentLevel}`, inline: true },
                { name: "Progress", value: `${level.currentExperience} / ${level.nextLevelExperience}\n${level.remaining} XP remaining`, inline: true },
                { name: "Wallet", value: `${user.primaryCurrency} ${CURRENCY_SYMBOLS[1]}\n${user.secondaryCurrency} ${CURRENCY_SYMBOLS[2]}`, inline: true },
                { name: "Registered since", value: `${registrationDate}`, inline: true }
                )
            .setColor(0x00FF00);        
        await interaction.editReply({ embeds: [embed] });

    }
}