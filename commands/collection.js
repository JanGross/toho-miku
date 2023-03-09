const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Card, User, Character } = require("../models");
const { QUALITY, QUALITY_NAMES } = require('../config/constants');
const UserUtils = require("../util/users");

const pageSize = 8;

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("collection")
            .setDescription("List all cards in your collection")
            .addStringOption((option) =>
                option
                .setName("character")
                .setDescription("Character to filter by")
                .setRequired(false)
                .setAutocomplete(true)
            )
            .addStringOption((option) =>
                option
                .setName("group")
                .setDescription("Group to filter by")
                .setRequired(false)
                .setAutocomplete(true)
            )
            .addStringOption((option) =>
                option
                .setName("quality")
                .setDescription("Quality to filter by")
                .setRequired(false)
                .addChoices(
                    { name: QUALITY_NAMES[1], value: "1"},
                    { name: QUALITY_NAMES[2], value: "2"},
                    { name: QUALITY_NAMES[3], value: "3"},
                    { name: QUALITY_NAMES[4], value: "4"},
                    { name: QUALITY_NAMES[5], value: "5"},
                    { name: QUALITY_NAMES[6], value: "6"},
                )                
            )
            ,
    permissionLevel: 0,
    async execute(interaction) {
        let user = await UserUtils.getUserByDiscordId(interaction.member.id);
        user.displayName = interaction.member.displayName; //FIXME: manually attaching the displayName is very hacky. We need to find a better way of passing along usernames!
        let offset = 0;
        let groupDupes = false;
        const uid = interaction.id;

        let embed = new EmbedBuilder()
            .setTitle("Collection")
            .setDescription("Loading your collection...")
            .setColor(0x00AE86);

        //add collector for pagination
        const collectorFilter = (i) => i.customId.includes(uid) && i.user.id === user.discordId;
        const collector = interaction.channel.createMessageComponentCollector({ collectorFilter, time: 60000 });
        
        const filter = {
            character: interaction.options.getString("character"),
            group: interaction.options.getString("group"),
            quality: interaction.options.getString("quality")
        }

        let row = this.getPaginateComponents(uid, prev=false, groupDupes=groupDupes);
        
        let embedMessage = await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: false,
            fetchReply: true
        });

        this.updatePageEmbed(uid, embedMessage, user, offset, groupDupes, filter);  

        collector.on('collect', async (i) => {
            i.deferUpdate();
            console.log(`Collected ${i.customId}`);
            if (i.customId === `previous-${uid}`) {
                //next
                offset-=pageSize;
            } else if (i.customId === `next-${uid}`) {
                //previous
                offset+=pageSize;
            }
            if (i.customId === `group-${uid}`) {
                groupDupes = !groupDupes;
            }
            this.updatePageEmbed(uid, embedMessage, user, offset, groupDupes, filter);
        });

        collector.on('end', collected => {
            embedMessage.edit({ components: [] });
            console.log(`Collected ${collected.     size} items`);
        });


    },

    getPaginateComponents(uid, prev=true, next=true, groupDupes=false) {
        //add buttons for pagination
        let row = new ActionRowBuilder();
        row.addComponents(
            new ButtonBuilder()
            .setCustomId(`previous-${uid}`)
            .setLabel(`Previous`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!prev),

            new ButtonBuilder()
            .setCustomId(`next-${uid}`)
            .setLabel(`Next`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!next),

            new ButtonBuilder()
            .setCustomId(`group-${uid}`)
            .setLabel(`Group Dupes`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji(groupDupes ? "✅" : "❌")
        );
        return row;
    },

    async updatePageEmbed(uid, i, user, offset, group, filterParam) {
        let cards;
        let filter = {
            where: {
                userId: user.id,
                burned: false
            },
            include: [{
                model: Character,
            }],
            limit: pageSize,
            offset: offset
        }
        
        if (group)  {
            filter["attributes"] = ["characterId", [Card.sequelize.fn("COUNT", "characterId"), "count"]];
            filter["order"] = [[Card.sequelize.literal("count"), "DESC"]];
            filter["group"] = ["characterId"];
        }

        if (filterParam["character"]) {
            filter["where"]["characterId"] = filterParam["character"];
        }

        if (filterParam["group"]) {
            filter["where"]['$Character.groupId$'] = filterParam["group"];
        }

        if (filterParam["quality"]) {
            filter["where"]["quality"] = filterParam["quality"];
        }

        cards = await Card.findAndCountAll(filter);
        cards.rows = cards.rows ? cards.rows : cards;
        let pageStart = offset + 1;
        let pageEnd = offset + cards.rows.length;
        let total = group ? cards.count.length : cards.count;
        //create embed using embedBuilder
        let embed = new EmbedBuilder()
            .setTitle(`${user.displayName}'s collection`)
            .setColor(0x00ff00)
            .setTimestamp()
            .setFooter({ text: `Cards ${pageStart} - ${pageEnd} / ${total}` });

        //if the user has no cards, tell him
        if (cards.count === 0) {
            embed.setTitle("You have no cards in your collection");
            embed.setDescription("Go and drop some with /drop");
            embed.setFooter(null);
            await i.edit({ embeds: [embed], components: [] });
            return;
        }

        //if the user has cards, list them
        for (let i = 0; i < cards.rows.length; i++) {
            let card = cards.rows[i];
            if (group) {
                embed.addFields({ 
                    name: `[${card.Character.id}] ${card.Character.name}`,
                    value: `${card.dataValues.count} in collection`,
                    inline: true
                });
            }
            if (!group) {
                embed.addFields({
                    inline: true,
                    name: `${i+offset+1} [${card.identifier}] ${card.Character.name}`,
                    value: `Print: ${card.printNr} Quality: ${card.quality}\nCollected: ${new Date(card.createdAt).toLocaleDateString('en-GB', { timeZone: 'UTC' })}`
                });
            }

            //Add a blank field every two items to force two columns
            if (i % 2 === 1) {
                embed.addFields({ name:'\u200b', value: '\u200b'});
            }
        }
        let components = this.getPaginateComponents(uid, prev=offset>0, next=pageEnd<cards.count, groupDupes=group);
        await i.edit({ embeds: [embed], components: [components] });
    }
}