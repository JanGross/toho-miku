require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9")
const { Guild } = require("../models");

module.exports = {
    name: "interactionCreate",
    async execute (interaction) {
        if (!interaction.isCommand()) return;

        const guild = await interaction.guild;
        //check if guild exists in database
        let guildData = await Guild.findOne({
            where: {
                guildID: guild.id
            }
        });

        if (!guildData) {
            //create guild in database
            await Guild.create({
                guildID: guild.id,
                ownerID: guild.ownerId,
            });
            //send guild registered message to the interations channel
            interaction.channel.send({
                content: `Guild ${guild.name} registered`,
                ephemeral: false
            });

        }
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

