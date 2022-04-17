const { SlashCommandBuilder } = require("@discordjs/builders");
const { User } = require("../models");


module.exports = {
    data: new SlashCommandBuilder()
            .setName("userlist")
            .setDescription("List all users"),
    async execute(interaction) {
        let users = await User.findAll();
        let userList = "";
        for (let i = 0; i < users.length; i++) {
            let username = await interaction.client.users.fetch(users[i].userID);
            userList += `${username.username}#${username.discriminator}`;
        }
        if (userList === "") {
            userList = "No users found";
        }
        interaction.reply({
            content: userList,
            ephemeral: false
        });
    }
}