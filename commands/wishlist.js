const { SlashCommandBuilder } = require("discord.js");

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
    permissionLevel: 1,
    async execute(interaction) {
        await interaction.deferReply();

        switch (interaction.options.getSubcommand()) {
            case "view":
                await interaction.editReply("Viewing your wishlist");
                break;
            case "compare":
                await interaction.editReply("Comparing your wishlist");
                break;
            case "edit":
                await interaction.editReply("Editing your wishlist");
                break;
            default:
                await interaction.editReply("hmmm");
                break;
        }

    }   
}