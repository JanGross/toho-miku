const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { Card, Character, Band } = require("../models");

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
                        { name: 'Band', value: 'band' },
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
        
        if (type === 'band') {
            let band = await Band.findOne({
                where: {
                    id: interaction.options.getInteger('id')
                }
            });
            if (!band) {
                interaction.editReply({
                    content: "Band not found",
                    ephemeral: true
                });
                return;
            }
            await band.update({
                enabled: interaction.options.getBoolean('enabled')
            });
            
            if (interaction.options.getBoolean('include_children')) {
                let characters = await Character.findAll({
                    where: {
                        bandId: band.id
                    }
                });
                Character.update({ 
                    enabled: (interaction.options.getBoolean('enabled') ? 1 : 0)}, {
                    where: { bandId: band.id }
                });
                
            }

            await interaction.editReply({
                content: `${band.name} is now ` 
                + `${(interaction.options.getBoolean('enabled') ? 'active' : 'inactive')} `
                + `(Including children: ${(interaction.options.getBoolean('include_children') ? 'yes' : 'no')})`
            });
            return;
        }
    }
}