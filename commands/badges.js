const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Card, User, Character } = require("../models");
const { QUALITY, QUALITY_NAMES } = require('../config/constants');
const { UserUtils, SearchUtils } = require("../util");

const pageSize = 8;

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("badges")
            .setDescription("List badges")
            .addStringOption((option) =>
                option
                .setName("filter")
                .setDescription("Name or ID")
                .setRequired(false)
                .setAutocomplete(false)
            )
            .addBooleanOption(option =>
                option.setName('owned')
                    .setDescription('Only show owned badges')
                    .setRequired(false)
            ),
    permissionLevel: 0,
    async execute(interaction) {
        await interaction.deferReply();
        let user = await UserUtils.getUserByDiscordId(interaction.member.id);
        let filter = interaction.options.getString("filter");
        let badges = await SearchUtils.findBadges(filter? filter:"", options={ 'user': user});
        let badgesStr = "Badges";

        badges['rows'].forEach(badge => {
            badgesStr += `${badge.name} \n`;
        });
        const embed = new EmbedBuilder()
            .setTitle(`This is where badges would show up`)
            .setDescription(`if it was implemented`)
            .addFields(
                { name: "Placeholder:", value: `${badgesStr}` },
            )
            .setColor(0x00ff00)
            .setFooter({ text: `Badges listed by ${interaction.member.displayName}` });

        let replyPayload = { embeds: [embed], fetchReply: true }
        const message = await interaction.editReply(replyPayload);
    },
}