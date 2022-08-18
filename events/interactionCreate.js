require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10")
const { Guild, User } = require("../models");

module.exports = {
    name: "interactionCreate",
    async execute (interaction) {
        if (!interaction.isCommand()) return;

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
        //check if the user exists in the database, if not tell him to use the /register command
        let user = await User.findOne({
            where: {
                discordId: interaction.member.id
            }
        });
        if (!user && interaction.commandName !== "register") {
            interaction.reply({
                content: `You are not registered, use the /register command`,
                ephemeral: false
            });
            return;
        }
        
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (err) {
            if (err) console.log(err);
            await interaction.reply({
                content: `An error occured processing the command :(\n \`\`\`${JSON.stringify(err, null, 2)}\`\`\``,
                ephemeral: false
            });
        }
    }
}

