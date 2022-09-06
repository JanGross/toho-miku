const { SlashCommandBuilder, ComponentType, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder } = require("discord.js");
const { Card, User, Character } = require("../models");
const UserUtils = require("../util/users");

const pageSize = 8;

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("editprofile")
            .setDescription("Edit your profile"),
    async execute(interaction) {
        let user = await UserUtils.getUserByDiscordId(interaction.member.id);

        let profile = await user.getProfile();
        console.log(profile['slotOne']);
        
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
    }
}