const { SlashCommandBuilder } = require("discord.js");
const { Card, User } = require("../models");
const { customAlphabet } = require("nanoid");

module.exports = {
    data: new SlashCommandBuilder()
            .setName("debug_drop")
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
                discordId: interaction.member.id
            }
        });

        //create new card with the given character id, and the user id
        const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPRSTUVWXYZ',6); //Up to 887.503.681 
        const identifier = nanoid();
        const existingCharacterCount = await Card.count({
            where: {
                characterId: interaction.options.getInteger("id")
            }
        });

        const card = await Card.create({
            characterId: interaction.options.getInteger("id"),
            identifier: identifier,
            quality: 1,
            printNr: existingCharacterCount + 1,
            userId: user.id
        });

        //reply with the new card id
        interaction.reply({
            content: `Dropped card ${card.id}`,
            ephemeral: false
        });
        
    }
}