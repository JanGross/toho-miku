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
                discordId: interaction.user.id
            }
        });
        if (user) {
            interaction.reply({
                content: "You are already registered",
                ephemeral: true
            });
        } else {
            await User.create({
                discordId: interaction.user.id,
                active: 1,
            });
            interaction.reply({
                content: "You are now registered",
                ephemeral: false
            });
        }
    }
}