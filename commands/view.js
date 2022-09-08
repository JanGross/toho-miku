const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require("discord.js");
const { Card, User, Band, Character } = require("../models");
const Rendering = require("../util/rendering");

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("view")
            .setDescription("View a specific card")
            .addStringOption((option) =>
                option
                    .setName("card")
                    .setDescription("Card identifier")
                    .setRequired(false)
                ),
    async execute(interaction) {
        await interaction.deferReply();
        const cardId = interaction.options.getString('card');
        const card = await Card.findOne({
            where: {
                identifier: cardId
            },
            include: [
                { model: Character, include: 
                    [Band] },
                User
            ]
        });
        if (!card) {
            interaction.reply({
                content: "Card not found",
                ephemeral: true
            });
            return;
        }

        let cardImage = await Rendering.renderCard(card);
        let attachment = new AttachmentBuilder(card);
        //get base filename
        let filename = cardImage.split("/").pop();

        let description = "";
        //Add a new line after every 4th (long) word or after a full stop
        let words = card.Character.description.split(" ");
        let count = 0;
        for (let i = 0; i < words.length; i++) {
            description += words[i] + " ";
            if (words[i].length > 3) {
                count++;
            }
            if (count >= 4 || words[i].endsWith(".")) {
                description += "\n";
                count = 0;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(`${card.Character.name}`)
            .setDescription(description)
            .setImage(`attachment://${filename}`)
            .setThumbnail(card.Character.Band.imageURL)
            .addFields(
                { name: "Owned by", value: `<@${card.User.discordId}>` },
                { name: "Band", value: `${card.Character.Band.name}` },
                { name: 'Print Number', value: `${card.printNr}`, inline: true },
                { name: 'Quality', value: `${card.quality}`, inline: true }
            )
            .setColor(0x00ff00)
            .setFooter({ text: `${card.identifier}`, iconURL: 'https://cdn.discordapp.com/attachments/856904078754971658/1017431187234508820/fp.png' })
            .setTimestamp(card.createdAt);
        const message = await interaction.editReply({ embeds: [embed], files: [cardImage], fetchReply: true });
    }
}