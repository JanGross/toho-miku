const { InteractionType } = require('discord.js');
const { UserUtils } = require('../util');
const { Card, Character, User } = require('../models');
const Sequelize = require('sequelize');
const { QUALITY_NAMES } = require('../config/constants');
const { TestStore } = require('../stores');
module.exports = {
    name: "interactionCreate",
    async execute (interaction) {
        let isRegistered = await UserUtils.registrationCheck(interaction);
        if (!isRegistered) return;
        if (interaction.type !== InteractionType.ApplicationCommandAutocomplete) return;
        console.log(`Autocomplete request from ${interaction.user.tag} (${interaction.user.id}) for ${interaction.commandName} with ${interaction.options.getFocused(true).value}`);
        
        let user = await UserUtils.getUserByDiscordId(interaction.member.id);
        let focusedOption = interaction.options.getFocused(true);
        let choices = [];
        
        if (interaction.commandName === "burn") {
            choices = await this.fetchCards(focusedOption, { user: user, ownedOnly: true });
        }

        if (interaction.commandName === "trade") {
            if (focusedOption.name === "card") {
                choices = await this.fetchCards(focusedOption, { user: user, ownedOnly: true });
            }
        }
        
        if (interaction.commandName === 'view') {
            const viewType = interaction.options.getString('type');

            switch (viewType) {
                case 'card':
                    choices = await this.fetchCards(focusedOption, { user: user});
                case 'character':
                    if(focusedOption.value.length < 3) break;
                    const characters = await Character.findAll({
                        where: {
                            name: {
                                [Sequelize.Op.like]: `%${focusedOption.value}%`
                            }
                        },
                        limit: 10
                    });
                    for (let i = 0; i < characters.length; i++) {
                        choices.push({
                            name: characters[i].name,
                            value: `${characters[i].id}`
                        });
                    }
                    break;
                case 'band':
                    break;
            }
        }
        if (choices.length > 0) {
            console.log(choices);
            await interaction.respond(choices);
        }
        return;
    },
    async fetchCards (focusedOption, options={}) {
        let choices = [];
        let condition = {
            where: {
                identifier: {
                    [Sequelize.Op.like]: `%${focusedOption.value}%`
                },
                burned: false
            },
            include: [{ model: Character }, { model: User }],
            limit: 10
        }
        if (options.ownedOnly) {
            condition.where.userId = { [Sequelize.Op.eq]: options.user.id };
        }
        const cards = await Card.findAll(condition);
        for (let i = 0; i < cards.length; i++) {
            let owned = "";
            if (options.user) {
                owned = cards[i].userId === options.user.id ? " (owned)" : "";
            }
            choices.push({
                name: `${cards[i].identifier} - ${cards[i].Character.name} (${QUALITY_NAMES[cards[i].quality]})${owned}`,
                value: cards[i].identifier
            });
        }
        return choices;
    }
}