const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const { Card, User, Band, Character } = require("../models");
const { Rendering, UserUtils } = require("../util");
const { QUALITY_NAMES } = require("../config/constants");
const fs = require("fs");
const edit = require("./edit");

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("view")
            .setDescription("View a specific card")
            .addStringOption((option) =>
                option
                    .setName("type")
                    .setDescription("The thing to view")
                    .setRequired(true)
                    .addChoices(
                        { name: 'card', value: 'card' },
                        { name: 'character', value: 'character' },
                        { name: 'band', value: 'band' }
                    )
                )
            .addStringOption((option) =>
                option
                    .setName("id")
                    .setDescription("Thing identifier")
                    .setRequired(true)
                    .setAutocomplete(true)
                ),
    permissionLevel: 0,
    async execute(interaction) {
        await interaction.deferReply();

        switch (interaction.options.getString("type")) {
            case "card":
                this.viewCard(interaction, interaction.options.getString("id"));
                break;
            case "character":
                this.viewCharacter(interaction, interaction.options.getString("id"));
                break;
            case "band":
                interaction.editReply({ content: "Band view is not yet implemented" });
                break;

        }
    },

    async viewCard(interaction, cardIdentifier) {
        let card = await Card.findOne({
            where: {
                identifier: cardIdentifier
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
        let cardImage = await Rendering.renderCard(card);
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
                { name: "Character ID", value: `${card.Character.id}` },
                { name: 'Print Number', value: `${card.printNr}`, inline: true },
                { name: 'Quality', value: `${QUALITY_NAMES[card.quality]} ${(card.quality === 6 ? '<a:sparklu:1019505245572837428>':'')}`, inline: true }
            )
            .setColor(0x00ff00)
            .setFooter({ text: `${card.identifier}`, iconURL: 'https://cdn.discordapp.com/attachments/856904078754971658/1017431187234508820/fp.png' })
            .setTimestamp(card.createdAt);
        if (card.burned) {
            embed.setColor(0xff0000);
            embed.addFields({ name: "Burned", value: "This card has been burned" });
        }
        const message = await interaction.editReply({ embeds: [embed], files: [cardImage], fetchReply: true });
    },

    async viewCharacter(interaction, characterId) {
        let isAdmin = await UserUtils.getPermissionLevel(interaction.member) == 2;
        let character = await Character.findOne({ 
            where: { id: characterId },
            include: [Band]
        });
        if (!character) {
            interaction.editReply({ content: "Character not found" });
            return;
        }
        let imagePath = `./assets/cards/${character.imageIdentifier}`;
        //if image doesn't exist, use placeholder
        if (!fs.existsSync(imagePath)) {
            imagePath = "./assets/cards/missing_image.png";
        }

        //get base filename
        let filename = imagePath.split("/").pop();

        let description = "";
        //Add a new line after every 4th (long) word or after a full stop
        let words = character.description.split(" ");
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
            .setTitle(`${character.name}`)
            .setDescription(description)
            .setImage(`attachment://${filename}`)
            .setThumbnail(character.Band.imageURL)
            .addFields(
                { name: "Band", value: `${character.Band.name}` },
                { name: "Character ID", value: `${character.id}` },
            )
            .setColor(0x00ff00)

        let row;
        if (isAdmin) {
            row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`edit-char-${character.id}`)   
                        .setLabel("Edit") 
                        .setStyle(ButtonStyle.Danger)
                );
        }
        const message = await interaction.editReply({ embeds: [embed], files: [imagePath], components: [row], fetchReply: true });
        const filter = (m) => m.member.user.id === interaction.member.user.id;
        const collector = message.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 120000 });

        collector.on('collect', async (m) => {
            console.log(`Collected ${m.customId}`);
            if (m.customId === `edit-char-${character.id}`) {
                await edit.execute(m, 'character', character.id);
            }
        });
    }
}