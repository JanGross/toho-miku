const { SlashCommandBuilder } = require("discord.js");
const { Card, User, Character } = require("../models");

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("collection")
            .setDescription("List all cards in your collection"),
    async execute(interaction) {
        //fetch the user given the userID and include his cards
        const user = await User.findOne({
            where: {
                discordId: interaction.member.id
            },
            include: [{ 
                model: Card, 
                include: [Character] 
            }]
        });

        //if the user has no cards, tell him
        if (user.Cards.length === 0) {
            interaction.reply({
                content: "You have no cards in your collection",
                ephemeral: true
            });
            return;
        }

        //if the user has cards, list them
        let message = "";
        for (let i = 0; i < user.Cards.length; i++) {
            message += `${user.Cards[i].id} - ${user.Cards[i].characterId} \n`;
            message += `Identifier: ${user.Cards[i].identifier} \n`;
            message += `Name: ${user.Cards[i].Character.name} \n`;
            message += `Image: ${user.Cards[i].Character.imageURL} \n`;
            message += `Quality: ${user.Cards[i].quality} \n`;
            message += `Print number: ${user.Cards[i].printNr} \n`;
            message += `------------------------ \n`;
        }
        interaction.reply({
            content: message,
            ephemeral: false
        });
                
    }
}