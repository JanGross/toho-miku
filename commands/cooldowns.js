const { SlashCommandBuilder } = require("discord.js");
const { Card, User, Character } = require("../models");
const { UserUtils } = require("../util");

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("cooldowns")
            .setDescription("List cooldowns"),
    permissionLevel: 0,
    async execute(interaction) {
        //fetch the user given the userID and include his cards
        const user = await UserUtils.getUserByDiscordId(interaction.member.id);

        //get user cooldowns using user utils
        const cooldowns = await UserUtils.getCooldowns(user, (await UserUtils.getPatreonPerks(interaction.client, user))['tier']);

        let reply = "Cooldowns:\n";
        if (cooldowns.remainingDrops > 0) {
            reply += `Drop: ${cooldowns.remainingDrops} remaining\n`;
        } else {
            reply += `Drop: Reset ${cooldowns.nextDropResetFormatted}\n`;
        }
        
        if (cooldowns.remainingClaims > 0) {
            reply += `Claim: ${cooldowns.remainingClaims} remaining\n`;
        } else {
            reply += `Claim: Reset ${cooldowns.nextClaimResetFormatted}\n`;
        }

        if (cooldowns.nextDaily > 0) {
            reply += `Daily: ${cooldowns.nextDailyFormatted}\n`;
        } else {
            reply += `Daily: Ready!\n`;
        }

        interaction.reply({
            content: reply,
            ephemeral: false
        });
                
    }
}