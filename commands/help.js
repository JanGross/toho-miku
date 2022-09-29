const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
            .setName("help")
            .setDescription("List all commands or info about a specific command")
            .addStringOption(option => 
                option.setName("command")
                .setDescription("The command to get info on")
                .setRequired(false)
            ),
    permissionLevel: 0,
    async execute(interaction) {
        await interaction.deferReply();
        
        //reply with a list of all commands
        if (!interaction.options.getString("command")) {
            let commands = [];
            const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(`./${file}`);
                if (!command.permissionLevel || command.permissionLevel < 2) {
                    commands.push(command.data.name);
                }
            }
            interaction.editReply({ content: `Here's a list of all my commands: \n \`${commands.join('`, `')}\`` });
            return;
        }
        //reply with info about a specific command
        else {
            const commandName = interaction.options.getString("command");
            const command = interaction.client.commands.get(commandName);
            if (!command) {
                await interaction.editReply(`Command /${commandName} does not exist`);
            }
            else {
                let reply = `Name: /${command.data.name}\n` +
                `Description: ${command.data.description}\n`+
                `Permission Level: ${command.permissionLevel}\n`;
                if (command.help) {
                    reply += `${command.help}\n`;
                }
                if (command.data.options) {
                    reply += `Options:\n`;
                    for (const option of command.data.options) {
                        reply += `\t${option.name}: ${option.description}\n`;

                        if (option.type === "SUB_COMMAND") {
                            reply += `\t\tOptions:\n`;
                            for (const subOption of option.options) {
                                reply += `\t\t\t${subOption.name}: ${subOption.description}\n`;
                            }
                        }
                    }
                }
                
                await interaction.editReply(reply);
            }
        }
    }
}
