const { SlashCommandBuilder } = require("discord.js");
const { Card, User, Character } = require("../models");
const { UserUtils } = require("../util");

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("cooldowns")
            .setDescription("List cooldowns"),
    async execute(interaction) {
        //fetch the user given the userID and include his cards
        const user = await UserUtils.getUserByDiscordId(interaction.member.id);

        //get user cooldowns using user utils
        const cooldowns = await UserUtils.getCooldowns(user);

        let reply = "Cooldowns:\n";
        for (cooldown in cooldowns) {
            //if cooldown contains the string formatted 
            if (cooldown.includes("Formatted")) {
                reply += `${cooldowns[cooldown]}\n`;
            }
        }

        interaction.reply({
            content: reply,
            ephemeral: false
        });
                
    }
}