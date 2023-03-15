const { SlashCommandBuilder } = require("discord.js");
const { Wishlist, Character } = require("../models");
const UserUtils = require("../util/users");

module.exports = {
    data: new SlashCommandBuilder()
            .setName("wishlist")
            .setDescription("View, edit or compare your wishlist")
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("view")
                    .setDescription("View your wishlist"))
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("compare")
                    .setDescription("Compare your wishlist with a users collection")
                    .addUserOption((option) =>
                        option
                            .setName("user")
                            .setDescription("User to compare with")
                            .setRequired(true)
                        ))
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("edit")
                    .setDescription("Add or remove a character from your wishlist")
                    .addStringOption((option) =>
                        option
                            .setName("character")
                            .setDescription("Character to add/remove")
                            .setRequired(true)
                            .setAutocomplete(true)
                        )
                    ),
    permissionLevel: 0,
    async execute(interaction) {
        await interaction.deferReply();
        let user = await UserUtils.getUserByDiscordId(interaction.member.id);
        let wishlist = await Wishlist.findOne({
            where: { UserId: user.id },
            include: [{ model: Character }]
        })
        if(!wishlist) {
            wishlist = await Wishlist.create({
                ping: false,
                UserId: user.id,
            });
            wishlist.Characters = []
            await interaction.channel.send("Created new wishlist");
        }
        switch (interaction.options.getSubcommand()) {
            case "view":
                let reply = `Wishlist entries (${wishlist.Characters.length}/5 used):\n`;
                wishlist.Characters.forEach(character => {
                    reply += `${character.name} \n`;
                });
                await interaction.editReply(reply);
                break;
            case "compare":
                await interaction.editReply("Comparing your wishlist");
                break;
            case "edit":
                let character = await Character.findOne({ 
                    where: { id: interaction.options.getString("character") }});

                if (await wishlist.hasCharacter(character)) {
                    await wishlist.removeCharacter(character)
                    await interaction.editReply(`Removed ${character.name} from your wishlist! ${wishlist.Characters.length-1}/5 used`);
                } else {
                    if (wishlist.Characters.length < 5) {
                        await wishlist.addCharacter(character);
                        await interaction.editReply(`Added ${character.name} to your wishlist! ${wishlist.Characters.length+1}/5 used`);
                    } else {
                        await interaction.editReply(`You have no remaining wishlist slots! ${wishlist.Characters.length}`);
                    }
                }
                break;
            default:
                await interaction.editReply("hmmm");
                break;
        }

    }   
}