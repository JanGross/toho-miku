const { SlashCommandBuilder } = require("@discordjs/builders");
const { Card, User, Character } = require("../models");

//fetch all cards owned by the user and list them
module.exports = {
    data: new SlashCommandBuilder()
            .setName("collection")
            .setDescription("List all cards in your collection"),
    async execute(interaction) {
        //fetch the user given the userID
        const user = await User.findOne({
            where: {
                userID: interaction.member.id
            }
        });

        //fetch all cards give the user id
        const cards = await Card.findAll({
            where: {
                ownerID: user.id
            },
            include: [{
                model: Character,
                as: "character"
            }]
        });

        //if the user has no cards, tell him
        if (cards.length === 0) {
            interaction.reply({
                content: "You have no cards in your collection",
                ephemeral: true
            });
            return;
        }

        //if the user has cards, list them
        let message = "";
        for (let i = 0; i < cards.length; i++) {
            message += `${cards[i].id} - ${cards[i].characterID} ${cards[i].character.name} \n`;
        }
        interaction.reply({
            content: message,
            ephemeral: false
        });
                
    }
}