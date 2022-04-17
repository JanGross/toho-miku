//User registration
const { SlashCommandBuilder } = require("@discordjs/builders");
const { User } = require("../models");

module.exports = {
    data: new SlashCommandBuilder()
            .setName("register")
            .setDescription("Register yourself"),
    async execute(interaction) {
        let user = await User.findOne({
            where: {
                userID: interaction.user.id
            }
        });
        if (user) {
            interaction.reply({
                content: "You are already registered",
                ephemeral: true
            });
        } else {
            await User.create({
                userID: interaction.user.id,
                banned: false,
                registredAt: new Date()
            });
            interaction.reply({
                content: "You are now registered",
                ephemeral: false
            });
        }
    }
}