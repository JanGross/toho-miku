const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const { Card, User, Band, Character } = require("../models");
const { QUALITY_VALUES, QUALITY_NAMES, CURRENCY_SYMBOLS } = require("../config/constants");
const { UserUtils } = require("../util");
const fs = require("fs");
const edit = require("./edit");

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("burn")
            .setDescription("Burn a specific card")
            .addStringOption((option) =>
                option
                    .setName("id")
                    .setDescription("Card identifier")
                    .setRequired(true)
                    .setAutocomplete(true)
                ),
    permissionLevel: 0,
    async execute(interaction) {
        await interaction.deferReply();

        let card = await Card.findOne({
            where: {
                identifier: interaction.options.getString("id")
            },
            include: [
                { model: Character, include: [{ model: Band }] },
                { model: User}
            ]
        });
        if (card === null) {
            interaction.editReply({ content: "Card not found" });
            return;
        }
        if (card.User.discordId !== interaction.user.id) {
            interaction.editReply({ content: "You do not own this card" });
            return;
        }
        if (card.burned) {
            interaction.editReply({ content: "This card is already burned" });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.member.displayName} burned ${card.identifier}`)
            .setDescription(`+${QUALITY_VALUES[card.quality].value} ${CURRENCY_SYMBOLS[QUALITY_VALUES[card.quality].type]}`)
            .addFields(
                { name: `${card.Character.name}`, value: `${card.Character.Band.name}` },
                { name: 'Print Number', value: `${card.printNr}`, inline: true },
                { name: 'Quality', value: `${QUALITY_NAMES[card.quality]}`, inline: true }
            )
            .setColor(0xFF0000)
            .setFooter({ text: `${card.identifier}`, iconURL: 'https://cdn.discordapp.com/attachments/856904078754971658/1017431187234508820/fp.png' })
            .setTimestamp(card.createdAt);
        
        let user = await UserUtils.getUserByDiscordId(interaction.user.id);
        await user.addCurrency(QUALITY_VALUES[card.quality].value, QUALITY_VALUES[card.quality].type, `burned ${card.identifier}`);
        await card.update({ burned: true });
        const message = await interaction.editReply({ embeds: [embed], fetchReply: true });
    }
}