const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { Card, Character, Band } = require("../models");

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("set_active")
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
                option.setName('active')
                    .setDescription('Active (true) or inactive (false)')
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
            let band = Band.findOne({
                where: {
                    id: interaction.options.getInteger('id')
                }
            });
            if (!band) {
                interaction.reply({
                    content: "Band not found",
                    ephemeral: true
                });
                return;
            }
            band.update({
                active: interaction.options.getBoolean('active')
            });
            
            if (interaction.options.getBoolean('include_children')) {
                let characters = await Character.findAll({
                    where: {
                        bandId: band.id
                    }
                });
                for (let character of characters) {
                    character.update({
                        active: interaction.options.getBoolean('active')
                    });
                }
            }

            await interaction.reply({
                content: `${band.name} is now ${(interaction.options.getBoolean('active') ? 'active' : 'inactive')} (Including children: ${interaction.options.getBoolean('include_children')})`,
            });
            return;
        }
        if (type === 'debug') {
            interaction.reply({
                content: 'Debug DEBUG',
                ephemeral: true
            });
            return;
        }

    }
}