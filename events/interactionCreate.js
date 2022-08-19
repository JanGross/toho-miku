require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10")
const { Guild, User } = require("../models");
const { UserUtils } = require("../util");

module.exports = {
    name: "interactionCreate",
    async execute (interaction) {
        let isRegistered = await UserUtils.registrationCheck(interaction);
        if (!isRegistered) return;
        console.log("User is registered");
        if (!interaction.isCommand()) return;
        console.log("Interaction is a command");

        const guild = await interaction.guild;
        //check if guild exists in database
        let guildData = await Guild.findOne({
            where: {
                guildId: guild.id
            }
        });

        if (!guildData) {
            //create guild in database
            await Guild.create({
                guildId: guild.id,
                adminRoleId: null,
                active: 1
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
                content: `An error occured processing the command :(\n \`\`\`${err.stack}\`\`\``,
                ephemeral: false
            });
        }
    }
}

