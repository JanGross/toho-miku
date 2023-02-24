const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { Card, Character, Group } = require("../models");

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("setenabled")
            .setDescription("Enable or disable entities")
            .addStringOption(option =>
                option.setName('type')
                    .setDescription('Entity type')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Group', value: 'group' },
                        { name: 'Character', value: 'character' },
                        { name: 'DEBUG', value: 'debug' },
                    )
            )
            .addIntegerOption(option =>
                option.setName('id')
                    .setDescription('Entity ID')
                    .setRequired(true)
            )
            .addBooleanOption(option =>
                option.setName('enabled')
                    .setDescription('Enabled (true) or Disabled (false)')
                    .setRequired(true)
            )
            .addBooleanOption(option =>
                option.setName('include_children')
                    .setDescription('Also set children')
                    .setRequired(false)
            ),
    permissionLevel: 2,
    async execute(interaction) {
        await interaction.deferReply();
        const type = interaction.options.getString('type');
        
        if (type === 'group') {
            let group = await Group.findOne({
                where: {
                    id: interaction.options.getInteger('id')
                }
            });
            if (!group) {
                interaction.editReply({
                    content: "Group not found",
                    ephemeral: true
                });
                return;
            }
            await group.update({
                enabled: interaction.options.getBoolean('enabled')
            });
            
            if (interaction.options.getBoolean('include_children')) {
                let characters = await Character.findAll({
                    where: {
                        groupId: group.id
                    }
                });
                Character.update({ 
                    enabled: (interaction.options.getBoolean('enabled') ? 1 : 0)}, {
                    where: { groupId: group.id }
                });
                
            }

            await interaction.editReply({
                content: `${group.name} is now ` 
                + `${(interaction.options.getBoolean('enabled') ? 'active' : 'inactive')} `
                + `(Including children: ${(interaction.options.getBoolean('include_children') ? 'yes' : 'no')})`
            });
            return;
        }
    }
}