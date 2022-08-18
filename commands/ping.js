const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
            .setName("ping")
            .setDescription("Ping, yes"),
    async execute(interaction) {
        interaction.reply({
            content: "Pong!",
            ephemeral: true
        });
    }
}