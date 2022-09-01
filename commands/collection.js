const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Card, User, Character } = require("../models");
const UserUtils = require("../util/users");

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
        
        //add buttons for pagination
        const row = new ActionRowBuilder();
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`previous-${uid}`)
                .setLabel(`Previous`)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`next-${uid}`)
                .setLabel(`Next`)
                .setStyle(ButtonStyle.Primary)
        );

        let embedMessage = await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: false,
            fetchReply: true
        });

        this.updatePageEmbed(embedMessage, user, offset);  

        //TODO: magic number 8 has to be refactored
        /*  BUGBUG: pagination goes past max cards showing empty pages
                    going lower than the first page throws SQL error
        */
        collector.on('collect', async (i) => {
            i.deferUpdate();
            if (i.customId === `previous-${uid}`) {
                //next
                offset-=8;
            } else if (i.customId === `next-${uid}`) {
                //previous
                offset+=8;
            }
            this.updatePageEmbed(embedMessage, user, offset);
        });

        collector.on('end', collected => {
            embedMessage.edit({ components: [] });
            console.log(`Collected ${collected.size} items`);
        });


    },

    async updatePageEmbed(i, user, offset) {
        const cardsPerPage = 8;
        let cards = await Card.findAndCountAll({
            where: {
                userId: user.id
            },
            limit: cardsPerPage,
            offset: offset,
            include: [{
                model: Character,
            }]
        });

        //create embed using embedBuilder
        let embed = new EmbedBuilder()
            .setTitle(`$'s collection`)
            .setColor(0x00ff00)
            .setTimestamp()
            .setFooter({ text: `Cards ${offset+1} - ${offset + cards.rows.length} / ${cards.count}` });

        //if the user has no cards, tell him
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

        await i.edit({ embeds: [embed] });
    }
}