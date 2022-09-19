require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10")
const { Guild, User } = require("../models");
const { UserUtils, GeneralUtils } = require("../util");

module.exports = {
    name: "interactionCreate",
    async execute (interaction) {
        let isMaintenance = await GeneralUtils.getBotProperty("maintenance");
        let permissionLevel = await UserUtils.getPermissionLevel(interaction.member);
        
        if (isMaintenance && permissionLevel < 2) {
            return interaction.reply({ content: "The bot is currently undergoing maintenance. Please try again later.", ephemeral: true });
        }

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
        
        //check if user has permissions to run the command
        //TODO: pass down this user object to avoid duplicate queries
        let user = await UserUtils.getUserByDiscordId(interaction.member.id);
        if (command.permissionLevel > permissionLevel) {
            interaction.reply({
                content: `You do not have permission to run this command`,
                ephemeral: true
            });
            return;
        }

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (err) {
            if (err) console.log(err);
            await interaction.channel.send({
                content: `An error occured processing the command :(\n \`\`\`${err.stack}\`\`\``,
                ephemeral: false
            });
        }
    }
}

