const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { UserUtils } = require('../util');
const { DAILY_REWARDS, CURRENCY_SYMBOLS } = require('../config/constants');

module.exports = {
    data: new SlashCommandBuilder()
            .setName("daily")
            .setDescription("Claim you daily rewards"),
    permissionLevel: 0,
    async execute(interaction) {
        await interaction.deferReply();
        let discordUser = interaction.options.getUser("user") ? interaction.options.getUser("user") : interaction.member.user;
        let user = await UserUtils.getUserByDiscordId(discordUser.id);
        

        let embed = new EmbedBuilder()
            .setTitle(`Daily claim`);

        const cooldowns = await UserUtils.getCooldowns(user);
        if (cooldowns.nextDaily > 0) {
            embed.addFields(
                { name: "Next daily reward:", value: `${cooldowns.nextDailyFormatted}` }
                )
            .setColor(0xFF0000);
            await interaction.editReply({ embeds: [embed] });
            return; //Return daily on cooldown
        }
        
        let patreonModifier = (await UserUtils.getPatreonPerks(interaction.client, user))['perks']?.['modifiers']['daily'];
        if(!patreonModifier) { patreonModifier = 1 }
        
        let rewardPrimary = DAILY_REWARDS['primary_currency'] * patreonModifier;
        let rewardSecondary = DAILY_REWARDS['secondary_currency'] * patreonModifier;
        let rewardExp = DAILY_REWARDS['experience'] * patreonModifier;

        user.addCurrency(rewardPrimary, 1, "daily");
        user.addCurrency(rewardSecondary, 2, "daily");
        user.addExperience(rewardExp, "daily");
        
        UserUtils.actionHandler(user, "daily");
        embed.addFields(
            { name: 'Patreon bonus', value: (patreonModifier > 1 ? `${patreonModifier}x modifier` : `No Patreon bonus`) },
            { name: "You claimed your daily rewards!", value: `${CURRENCY_SYMBOLS[1]} ${rewardPrimary}\n${CURRENCY_SYMBOLS[2]} ${rewardSecondary}\nXP ${rewardExp}` }
            )
        .setColor(0x00FF00);
        await interaction.editReply({ embeds: [embed] });

    }
}