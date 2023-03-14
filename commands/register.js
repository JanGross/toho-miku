//User registration
const { SlashCommandBuilder } = require("discord.js");
const { User } = require("../models");

module.exports = {
    data: new SlashCommandBuilder()
            .setName("register")
            .setDescription("Register yourself"),
    permissionLevel: 0,
    async execute(interaction) {
        await interaction.deferReply();
        let user = await User.findOne({
            where: {
                discordId: interaction.user.id
            }
        });
        if (user) {
            interaction.editReply({
                content: "You are already registered",
                ephemeral: true
            });
        } else {
            await User.create({
                discordId: interaction.user.id,
                active: 1,
                nextDropReset: 0,
                nextClaimReset: 0,
                nextDaily: 0
            });
            interaction.editReply({
                content: "You are now registered",
                ephemeral: false
            });
        }
    }
}