const { SlashCommandBuilder, ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputStyle, TextInputBuilder } = require("discord.js");
const { Character, Band, RecordHistory } = require("../models");
const { UserUtils, GeneralUtils } = require("../util");
const axios = require("axios");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
            .setName("edit")
            .setDescription("Admin command to edit records")
            .addStringOption((option) =>
                option
                    .setName("type")
                    .setDescription("The thing to edit")
                    .setRequired(true)
                    .addChoices(
                        { name: 'character', value: 'character' },
                        { name: 'band', value: 'band' }
                    )
                )
            .addStringOption((option) =>
                option
                    .setName("id")
                    .setDescription("Thing ID")
                    .setRequired(true)
                )
            .addAttachmentOption((option) =>
                option
                    .setName("attachement")
                    .setDescription("Attachement to be used")
                    .setRequired(false)
                ),
    permissionLevel: 2,
    async execute(interaction, type=undefined, id=undefined) {
        await interaction.deferReply();
        let user = await UserUtils.getUserByDiscordId(interaction.member.id);

        let options = [];
        let record;
        switch (interaction.options?.getString("type") ?? type) {
        case "character":
            record = await Character.findByPk(interaction.options?.getString("id") ?? id, { include: Band });
            if (!record) {
                interaction.editReply({ content: "Character not found" });
                return;
            }
            options = [ "name", "description", "imageIdentifier" ];
            break;
        case "band":
            options = [ "name", "description" ];
            break;
        default:
            interaction.reply({
                content: `Your permission level is ${await UserUtils.getPermissionLevel(interaction.member)}`,
                ephemeral: false
            });
            break;
        }

        //row of button components to select what property to edit
        const row = new ActionRowBuilder();
        for (option of options) {
            row.addComponents(
                new ButtonBuilder()
                    .setLabel(`Edit ${option}`)
                    .setCustomId(`${option}-${interaction.id}`)
                    .setStyle(ButtonStyle.Primary)
            );
        }

        //show buttons
        let message = await interaction.editReply({ content: `You've selected [${record.identifier ?? record.id}] ${record.name}`, components: [row], fetchReply: true });

        //filter only events from the user who triggered the command
        const filter = (m) => m.author.id === interaction.author.id && m.customId.endsWith(interaction.id);
        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 65000 })

        collector.on('collect', async (m) => {
            let option = m.customId.split("-")[0];
            switch (option) {
                case 'name':
                    let newName = await this.openStringModal(m, `Edit ${option} for ${record.name}`, "");
                    if (newName) {
                        await this.updateRecord(user, record, option, newName.value);
                    }
                    break;
                case 'description':
                    let newDesc = await this.openParagraphModal(m, `Edit ${option} for ${record.name}`, "");
                    if (newDesc) {
                        await this.updateRecord(user, record, option, newDesc.value);
                    }
                    break;
                case 'imageIdentifier':
                    m.deferReply();
                    let allowedContentTypes = [ "image/png", "image/jpeg", "image/gif" ];
                    let image = interaction.options.getAttachment("attachement");
                    if (!image) {
                        await m.reply({ content: "You must attach an image", ephemeral: true });
                        return;
                    }
                    if (!allowedContentTypes.includes(image.contentType)) {
                        await m.reply({ content: "An invalid image has been attached", ephemeral: true });
                        return;
                    }
                    let identifier = `${record.Band.name.replace(" ", "_")}/${image.name}`;
                    let path = `/app/assets/cards/${identifier}`;
                    await this.downloadImage(image.attachment, path);
                    await this.updateRecord(user, record, option, identifier);
                    m.editReply({ content: "Attached image has been applied" });
                    break;
                default:
                    m.reply({ content: "Invalid selection" });
                    break;
            }
        });
    },
    async downloadImage(url, path) {
        let imageBuffer = await axios.get(url, { responseType: 'arraybuffer' });
        fs.writeFileSync(path, imageBuffer.data);
    },

    async openParagraphModal(interaction, title, placeholder) {
        const modal = new ModalBuilder()
            .setCustomId('paragraphModal')
            .setTitle(title.substr(0, 44));

        let row = new ActionRowBuilder();
        let textInput = new TextInputBuilder()
            .setCustomId(`input-${interaction.id}`)
            .setLabel("Enter new value")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(255)
            .setPlaceholder(placeholder ?? "We've been trying to get a hold of you about your car's extended warranty.");
        row.addComponents(textInput);
        modal.addComponents(row);

        let message = await interaction.showModal(modal);

        let submitted = await interaction.awaitModalSubmit({
            time: 300000,
            filter: i => i.user.id === interaction.user.id,
          }).catch(error => {
            console.error(error)
            return null
          })
          
          if (submitted) {
            submitted.reply({ content: `You submitted: ${submitted.fields.getTextInputValue(`input-${interaction.id}`)}`})
            return { i: submitted, value: submitted.fields.getTextInputValue(`input-${interaction.id}`)};
          }
    },
    async openStringModal(interaction, title, placeholder) {
        const modal = new ModalBuilder()
            .setCustomId('textModal')
            .setTitle(title.substr(0, 44));

        let row = new ActionRowBuilder();
        let textInput = new TextInputBuilder()
            .setCustomId(`input-${interaction.id}`)
            .setLabel("Enter new value")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(255)
            .setPlaceholder(placeholder ?? "");
        row.addComponents(textInput);
        modal.addComponents(row);

        let message = await interaction.showModal(modal);

        let submitted = await interaction.awaitModalSubmit({
            time: 300000,
            filter: i => i.user.id === interaction.user.id,
          }).catch(error => {
            console.error(error)
            return null
          })
          
          if (submitted) {
            submitted.reply({ content: `You submitted: ${submitted.fields.getTextInputValue(`input-${interaction.id}`)}` });
            return { i: submitted, value: submitted.fields.getTextInputValue(`input-${interaction.id}`)};
          }
    },
    async updateRecord(user, record, property, value) {
        let history = {
            affectedId: record.id,
            userId: user.id,
            type: record.constructor.name,
            property: property,
            oldValue: record[property],
            newValue: value
        }
        record[property] = value;
        await record.save();
        await RecordHistory.create(history);
    }
}