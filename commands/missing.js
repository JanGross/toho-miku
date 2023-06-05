const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const { Card, User, Group, Character, Badge } = require("../models");
const { Rendering, UserUtils } = require("../util");
const { QUALITY_NAMES } = require("../config/constants");
const Sequelize = require("sequelize");
const fs = require("fs");
const edit = require("./edit");

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
        .setName("missing")
        .setDescription("View missing things")
        .addStringOption((option) =>
            option
                .setName("group_id")
                .setDescription("Thing identifier")
                .setRequired(false)
                .setAutocomplete(true)
        ),
    permissionLevel: 0,
    async execute(interaction) {
        await interaction.deferReply();

        let groupId = interaction.options.getString("group_id");
        let user = await UserUtils.getUserByDiscordId(interaction.member.user.id);

        if (groupId) {
            try {
                let missingCards = await this.FindMissingFromGroup(user.id, groupId);
                await interaction.editReply(JSON.stringify(missingCards));
                return;
            } catch (error) {
                console.error('Error:', error);
                throw error;
            }
        }

        let missingCount = await this.CountMissingFromGroup(user.id);
        await interaction.editReply(JSON.stringify(missingCount));
        return;
    },
    async CountMissingFromGroup(userId) {
        try {
            const groups = await Group.findAll({ 
                where: { enabled: 1 }
            });

            const missingCountByGroup = await Promise.all(
                groups.map(async (group) => {
                    const characters = await Character.findAll({
                        where: { groupId: group.id, enabled: 1 },
                        include: [
                            {
                                model: Card,
                                where: { userId: userId },
                                required: false,
                            },
                        ],
                    });

                    const missingCount = characters.reduce((total, character) => {
                        return total + (character.Cards.length === 0 ? 1 : 0);
                    }, 0);

                    return {
                        groupId: group.id,
                        groupName: group.name,
                        missingCount: missingCount,
                    };
                })
            );

            return missingCountByGroup;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },
    async FindMissingFromGroup(userId, groupId) {
        const missingCards = await Character.findAll({
            attributes: ['groupId', 'id', 'name'],
            include: [{
                model: Card,
                attributes: [],
                required: false,
                where: { userId: userId, burned: 0 },
            }],
            where: { groupId: groupId },
            having: Sequelize.literal('COUNT(Cards.id) = 0'),
            group: ['Character.id'],
        });

        return missingCards;
    }
}