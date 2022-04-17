require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9")

module.exports = {
    name: "interactionCreate",
    async execute (interaction) {
        if (!interaction.isCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (err) {
            if (err) console.log(err);
            await interaction.reply({
                content: "An error occured processing the command",
                ephemeral: true
            });
        }
    }
}

