const { SlashCommandBuilder, ComponentType, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder } = require("discord.js");
const { Card, User, Character } = require("../models");
const UserUtils = require("../util/users");

const pageSize = 8;

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("editprofile")
            .setDescription("Edit your profile"),
    permissionLevel: 0,
    async execute(interaction) {
        let user = await UserUtils.getUserByDiscordId(interaction.member.id);

        let profile = await user.getProfile();
        
        

        //row of button components to select what property to edit
        const row = new ActionRowBuilder();
        row.addComponents(
            new ButtonBuilder()
                .setLabel('Edit Status')
                .setCustomId('editStatus')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setLabel('Edit Showcase')
                .setCustomId('editShowcase')
                .setStyle(ButtonStyle.Primary)
        );

        //show buttons
        let message = await interaction.reply({ content: "", components: [row], fetchReply: true });

        //filter only events from the user who triggered the command
        const filter = (m) => m.author.id === interaction.author.id;
        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 25000 })

        collector.on('collect', async (m) => {
            switch (m.customId) {
                case 'editStatus':
                    await this.openStatusModal(m, user, profile);
                    break;
                case 'editShowcase':
                    await this.openShowcaseModal(m, user, profile);
                    break;
                default:
                    m.reply({ content: "Invalid selection" });
                    break;
            }
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
            filter: i => i.user.id === interaction.user.id,
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
            .setCustomId('descriptionModal')
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
            filter: i => i.user.id === interaction.user.id,
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