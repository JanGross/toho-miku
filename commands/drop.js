const { SlashCommandBuilder } = require("@discordjs/builders");
const { Card, User } = require("../models");

module.exports = {
    data: new SlashCommandBuilder()
            .setName("drop")
            .setDescription("Drop a card")
            .addIntegerOption((option) =>
                option
                    .setName("id")
                    .setDescription("The id of the character to drop")
                    .setRequired(true)
                ),

    async execute(interaction) {
        //get user id from database given the userID
        const user = await User.findOne({
            where: {
                userID: interaction.member.id
            }
        });

        //create new card with the given character id, and the user id
        const card = await Card.create({
            characterID: interaction.options.getInteger("id"),
            identifier: "00000",
            ownerID: user.id,
        });

        //reply with the new card id
        interaction.reply({
            content: `Dropped card ${card.id}`,
            ephemeral: false
        });
        
    }
}