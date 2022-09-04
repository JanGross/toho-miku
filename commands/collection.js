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
        const uid = interaction.id;

        let embed = new EmbedBuilder()
            .setTitle("Collection")
            .setDescription("Loading your collection...")
            .setColor(0x00AE86);

        //add collector for pagination
        const filter = (i) => i.customId === `previous-${uid}` || i.customId === `next-${uid}`;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
        
        let row = this.getPaginateComponents(uid, prev=false);
        
        let embedMessage = await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: false,
            fetchReply: true
        });

        this.updatePageEmbed(uid, embedMessage, user, offset);  

        collector.on('collect', async (i) => {
            i.deferUpdate();
            if (i.customId === `previous-${uid}`) {
                //next
                offset-=pageSize;
            } else if (i.customId === `next-${uid}`) {
                //previous
                offset+=pageSize;
            }
            this.updatePageEmbed(uid, embedMessage, user, offset);
        });

        collector.on('end', collected => {
            embedMessage.edit({ components: [] });
            console.log(`Collected ${collected.     size} items`);
        });


    },

    getPaginateComponents(uid, prev=true, next=true) {
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
            .setDisabled(!next)
        );
        return row;
    },

    async updatePageEmbed(uid, i, user, offset) {
        let cards = await Card.findAndCountAll({
            where: {
                userId: user.id
            },
            limit: pageSize,
            offset: offset,
            include: [{
                model: Character,
            }]
        });

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
            embed.addFields({
                inline: true,
                name: `${i+offset+1}:[${card.identifier}] ${card.Character.name}`,
                value: `P: ${card.printNr} Q: ${card.quality}`
            });

            //Add a blank field every two items to force two columns
            if (i % 2 === 1) {
                embed.addFields({ name:'\u200b', value: '\u200b'});
            }
        }
        let components = this.getPaginateComponents(uid, prev=offset>0, next=pageEnd<cards.count);
        await i.edit({ embeds: [embed], components: [components] });
    }
}