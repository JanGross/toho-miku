const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Card, User, Character } = require("../models");
const UserUtils = require("../util/users");

const pageSize = 8;

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("collection")
            .setDescription("List all cards in your collection"),
    async execute(interaction) {
        let user = await UserUtils.getUserByDiscordId(interaction.member.id);
        let offset = 0;
        let groupDupes = false;
        const uid = interaction.id;

        let embed = new EmbedBuilder()
            .setTitle("Collection")
            .setDescription("Loading your collection...")
            .setColor(0x00AE86);

        //add collector for pagination
        const filter = (i) => i.customId.includes(uid);
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
        
        let row = this.getPaginateComponents(uid, prev=false, groupDupes=groupDupes);
        
        let embedMessage = await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: false,
            fetchReply: true
        });

        this.updatePageEmbed(uid, embedMessage, user, offset, groupDupes);  

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
            this.updatePageEmbed(uid, embedMessage, user, offset, groupDupes);
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

    async updatePageEmbed(uid, i, user, offset, group) {
        let cards
        if (group)  {
            cards = await Card.findAndCountAll({
                where: {
                    userId: user.id
                },
                group: ["characterId"],
                attributes: ["characterId", [Card.sequelize.fn("COUNT", "characterId"), "count"]],
                order: [[Card.sequelize.literal("count"), "DESC"]],
                include: [{
                    model: Character,
                }],
                limit: pageSize,
                offset: offset
            });
            cards.count = cards.count.length;
        } else {
            cards = await Card.findAndCountAll({
                where: {
                    userId: user.id
                },
                limit: pageSize,
                offset: offset,
                include: [{
                    model: Character,
                }]
            });
        }
        cards.rows = cards.rows ? cards.rows : cards;
        let pageStart = offset + 1;
        let pageEnd = offset + cards.rows.length;

        //create embed using embedBuilder
        let embed = new EmbedBuilder()
            .setTitle(`$'s collection`)
            .setColor(0x00ff00)
            .setTimestamp()
            .setFooter({ text: `Cards ${pageStart} - ${pageEnd} / ${cards.count}` });

        //if the user has no cards, tell him
        //BUGBUG: no longer working with the new embed flow
        if (cards.count === 0) {
            embed.setTitle("You have no cards in your collection");
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