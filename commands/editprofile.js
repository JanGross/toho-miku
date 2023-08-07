const { SlashCommandBuilder, ComponentType, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, Attachment } = require("discord.js");
const { Card, User, Character } = require("../models");
const { UserUtils, ReplyUtils, GeneralUtils } = require("../util");

const pageSize = 8;

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("editprofile")
            .setDescription("Edit your profile")
            .addAttachmentOption((option) =>
                option
                    .setName("attachement")
                    .setDescription("Attachement to be used")
                    .setRequired(false)
                ),
    permissionLevel: 0,
    async execute(interaction) {
        await interaction.deferReply();
        let user = await UserUtils.getUserByDiscordId(interaction.member.id);
        let patreon = await UserUtils.getPatreonPerks(interaction.client, user);
        let profile = await user.getProfile();
        
        

        //row of button components to select what property to edit
        const mainRow = new ActionRowBuilder();
        mainRow.addComponents(
            new ButtonBuilder()
                .setLabel('Edit Status')
                .setCustomId('editStatus')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setLabel('Edit Showcase')
                .setCustomId('editShowcase')
                .setStyle(ButtonStyle.Primary)
        );

        if (patreon.perks?.["custom_bg"] === true && interaction.options.getAttachment("attachement")) {
            mainRow.addComponents(
                new ButtonBuilder()
                .setLabel('Set attachment as custom background')
                .setCustomId('setCustomBg')
                .setStyle(ButtonStyle.Primary)
            );
        }

        const pingRow = new ActionRowBuilder();
        pingRow.addComponents(
            new ButtonBuilder()
                .setLabel('Wishlist Ping')
                .setCustomId('toggle-wishlist-ping')
                .setStyle(user.wishlistPing ? ButtonStyle.Success : ButtonStyle.Primary),
                new ButtonBuilder()
                .setLabel('Drop Ping')
                .setCustomId('toggle-drop-ping')
                .setStyle(user.dropPing ? ButtonStyle.Success : ButtonStyle.Primary),
                new ButtonBuilder()
                .setLabel('Daily Ping')
                .setCustomId('toggle-daily-ping')
                .setStyle(user.dailyPing ? ButtonStyle.Success : ButtonStyle.Primary)
        );

        //show buttons
        let message = await interaction.editReply({ content: "", components: [mainRow, pingRow], fetchReply: true });

        //filter only events from the user who triggered the command
        const filter = (m) => m.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter: filter, componentType: ComponentType.Button, time: 300000 })

        collector.on('collect', async (i) => {
            switch (i.customId) {
                case 'editStatus':
                    await this.openStatusModal(i, user, profile);
                    break;
                case 'editShowcase':
                    await this.openShowcaseModal(i, user, profile);
                    break;
                case 'setCustomBg':
                    await i.deferReply();
                    let allowedContentTypes = [ "image/png", "image/jpeg" ];
                    let image = interaction.options.getAttachment("attachement");
                    if (!allowedContentTypes.includes(image.contentType)) {
                        await i.editReply({ content: "An invalid image has been attached. Allowed are .png and .jpeg", ephemeral: true });
                        return;
                    }
                    await GeneralUtils.downloadFile(image.url, `/app/assets/userdata/profiles/${image.id}_${image.name}`);
                    profile.customBackground = `${process.env.ASSET_URL}/userdata/profiles/${image.id}_${image.name}`;  
                    await profile.save();
                    await i.editReply('Custom profile background has been set!');
                    break;
                case 'toggle-wishlist-ping':
                    await i.deferUpdate();
                    user.wishlistPing = !user.wishlistPing;
                    user.save();
                    break;
                case 'toggle-drop-ping':
                    await i.deferUpdate();
                    user.dropPing = !user.dropPing;
                    user.save();
                    break;
                case 'toggle-daily-ping':
                    await i.deferUpdate();
                    user.dailyPing = !user.dailyPing;
                    user.save();
                    break;
                default:
                    await i.deferReply();
                    i.editReply({ content: "Invalid selection" });
                    return;
                    break;
            }

            let newComponents= ReplyUtils.recreateComponents(message.components);
            newComponents[1].components.forEach(component => {
                if(component.data.custom_id == i.customId) {
                    component.setStyle((component.data.style == 1) ? 3 : 1);
                    console.log(`Changed style of ${component.data.custom_id} is now ${component.data.style}`);
                }
            });
            await message.edit({ components: newComponents });
        });
    },
    async openShowcaseModal(interaction, user, profile) {
        const modal = new ModalBuilder()
			.setCustomId('cardSlotModal')
			.setTitle('Edit card showcase');

        let slots = ['slotOne', 'slotTwo', 'slotThree', 'slotFour'];
        for (slot of slots) {
            let cardIDComponenets = new ActionRowBuilder();
            let cardInput = new TextInputBuilder()
                .setCustomId(slot)
                .setLabel(`Set ${slot}`)
                .setStyle(TextInputStyle.Short)
                .setRequired(false);            
            let currentCard = await Card.findOne({ where: { id: profile[slot] }, include: [Character] });
            if (currentCard) {
                cardInput.setPlaceholder(`${currentCard.Character.name} (${currentCard.identifier})`);
            }
            cardIDComponenets.addComponents(cardInput);
            modal.addComponents(cardIDComponenets);
        }

        let message = await interaction.showModal(modal);

        let submitted = await interaction.awaitModalSubmit({
            time: 60000,
            filter: i => i.user.id === interaction.user.id && i.customId === 'cardSlotModal',
          }).catch(error => {
            //Error includes timeout
            console.error(error)
            return null
          })
          if (submitted) {
            let updatePayload = {};
            for (slot of slots) {
                if (submitted.fields.getTextInputValue(slot) != profile[slot]) {
                    //fetch card from db
                    let card = await Card.findOne({ where: { identifier: submitted.fields.getTextInputValue(slot) } });
                    if (card) {
                        updatePayload[slot] = card.id;
                    }
                }
            }
            profile.update(updatePayload);
            await submitted.reply({
              content: `Updated showcase`,
            })
          }
    },
    async openStatusModal(interaction, user, profile) {
        const modal = new ModalBuilder()
            .setCustomId('statusModal')
            .setTitle('Edit profile status/description');

        let row = new ActionRowBuilder();
        let statusInput = new TextInputBuilder()
            .setCustomId('profileStatus')
            .setLabel(`Your status`)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(155)
            .setPlaceholder(profile.customStatus ? profile.customStatus.slice(0,90) + '...' : "No status set");
        row.addComponents(statusInput);
        modal.addComponents(row);

        let message = await interaction.showModal(modal);

        let submitted = await interaction.awaitModalSubmit({
            time: 300000,
            filter: i => i.user.id === interaction.user.id && i.customId === 'statusModal',
          }).catch(error => {
            //Error includes timeout
            console.error(error)
            return null
          })
          
          if (submitted) {
            let updatePayload = {};
            if (submitted.fields.getTextInputValue('profileStatus') != profile.customStatus) {
                profile.update({customStatus: submitted.fields.getTextInputValue('profileStatus')});
            }
            await submitted.reply({
              content: `Updated status`,
            })
          }
    }

}