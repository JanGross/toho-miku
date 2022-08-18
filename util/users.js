const { User } = require("../models");

module.exports = {
    name: "UserUtils",
    getUserByDiscordId: async function(discordId) {
        return await User.findOne({
            where: {
                discordId: discordId
            }
        });
    },

    registrationCheck: async function(interaction) {
        let user = await this.getUserByDiscordId(interaction.member.id);
        if (user) {
            return true;
        }
        if (!interaction.isButton() && interaction.commandName === "register") {
            return true;
        }
        interaction.reply({
            content: `${interaction.member} You are not registered, use the /register command`,
            ephemeral: false
        });
        
        return false;
    }
}
