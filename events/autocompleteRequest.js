const { InteractionType } = require('discord.js');
const { UserUtils, SearchUtils } = require('../util');
const { Character, Group } = require('../models');

module.exports = {
    name: "interactionCreate",
    async execute (interaction) {
        if (interaction.type !== InteractionType.ApplicationCommandAutocomplete) return;
        let isRegistered = await UserUtils.registrationCheck(interaction);
        if (!isRegistered) return;
        console.log(`Autocomplete request from ${interaction.user.tag} (${interaction.user.id}) for ${interaction.commandName} with ${interaction.options.getFocused(true).value}`);
        
        let user = await UserUtils.getUserByDiscordId(interaction.member.id);
        let focusedOption = interaction.options.getFocused(true);
        let choices = [];
        
        if (interaction.commandName === "burn") {
            choices = (await SearchUtils.findCards(focusedOption, { user: user, ownedOnly: true }))["choices"];
        }

        if (interaction.commandName === "trade") {
            if (focusedOption.name === "card") {
                choices = (await SearchUtils.findCards(focusedOption, { user: user, ownedOnly: true }))["choices"];
            }
        }
        
        if (interaction.commandName === 'view') {
            const viewType = interaction.options.getString('type');

            switch (viewType) {
                case 'card':
                    choices = (await SearchUtils.findCards(focusedOption, { user: user}))["choices"];
                    break;
                case 'character':
                    choices = (await SearchUtils.findByName(Character, focusedOption.value))["choices"];
                    break;
                case 'group':
                    choices = (await SearchUtils.findByName(Group, focusedOption.value))["choices"];
                    break;
            }
        }

        if (interaction.commandName === 'missing') {

            choices = (await SearchUtils.findByName(Group, focusedOption.value))["choices"];

        }

        if (interaction.commandName === 'wishlist') {
            choices = (await SearchUtils.findByName(Character, focusedOption.value))["choices"];
        }

        if (interaction.commandName === 'collection') {
            const character = interaction.options.getString('character');
            const group = interaction.options.getString('group');
            const quality = interaction.options.getString('quality');
            //TODO: avoid duplicate code hehe
            switch (focusedOption.name) {
                case 'character':
                    choices = (await SearchUtils.findByName(Character, focusedOption.value))["choices"];
                    break;
                case 'group':
                    choices = (await SearchUtils.findByName(Group, focusedOption.value))["choices"];
                    break;
            }
        }
        if (choices.length > 0) {
            choices = choices.splice(0,10);
            console.log(choices);
            await interaction.respond(choices);
        }
        return;
    },
}