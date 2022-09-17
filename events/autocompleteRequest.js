const { InteractionType } = require('discord.js');
const { UserUtils } = require('../util');
const { Card, Character, User } = require('../models');
const Sequelize = require('sequelize');
module.exports = {
    name: "interactionCreate",
    async execute (interaction) {
        let isRegistered = await UserUtils.registrationCheck(interaction);
        if (!isRegistered) return;
        if (interaction.type !== InteractionType.ApplicationCommandAutocomplete) return;
        console.log(`Autocomplete request from ${interaction.user.tag} (${interaction.user.id}) for ${interaction.commandName} with ${interaction.options.getFocused(true).value}`);
        if (interaction.commandName === 'view') {
            const viewType = interaction.options.getString('type');
            let focusedOption = interaction.options.getFocused(true);
            
            let choices = [];
            
            switch (viewType) {
                case 'card':
                    const cards = await Card.findAll({
                        where: {
                            identifier: {
                                [Sequelize.Op.like]: `%${focusedOption.value}%`
                            }
                        },
                        include: [{ model: Character }, { model: User }],
                        limit: 10
                    });
                    for (let i = 0; i < cards.length; i++) {
                        choices.push({
                            name: `${cards[i].identifier} - ${cards[i].Character.name}`,
                            value: cards[i].identifier
                        });
                    }
                    break;
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
                
            await interaction.respond(choices);
            return;
        }
    }
}