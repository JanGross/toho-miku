const { Guild } = require("../models");

module.exports = {
    name: "GuildUtils",
    getProperty: async function(guildId, property) {
        let guild = await Guild.findOne({
            where: {
                guildId: guildId
            }
        });
        return property ? guild[property] : guild;
    },

    setProperty: async function(guildId, property, value) {
        let guild = await Guild.findOne({
            where: {
                guildId: guildId
            }
        });
        guild[property] = value;
        await guild.save();
    }
}
