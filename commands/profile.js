const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Card, User, Character } = require("../models");
const UserUtils = require("../util/users");

const pageSize = 8;

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("profile")
            .setDescription("View your profile"),
    async execute(interaction) {
        let user = await UserUtils.getUserByDiscordId(interaction.member.id);

        let profile = await user.getProfile();
        await interaction.reply(`json: ${JSON.stringify(profile)}`);
    }
}