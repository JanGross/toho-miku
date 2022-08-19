const { User, Guild } = require("../models");
const GeneralUtils = require("./general");

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
    },

    getCooldowns: async function(user) {
        /* Returns an object with the following properties:
            * now: the current time in milliseconds
            --- For each key in cooldownKeys ---
                * nextPullTimestamp: the next time the user can pull a card in milliseconds
                * pullCooldown: time in milliseconds until the user can pull again
                * pullCooldownFormatted: print friendly version of pullCooldown in hours and minutes
        */

        const cooldownKeys = ["Pull", "Drop", "Daily"]

        let reply = {
            now: new Date().getTime()
        };

        for (key of cooldownKeys) {
            reply[`next${key}Timestamp`] = user[`next${key}`].getTime();
            let cooldown = Math.max(reply[`next${key}Timestamp`] - reply['now'], 0);
            reply[`${key.toLowerCase()}Cooldown`] = cooldown;
            if (cooldown > 0) {
                reply[`${key.toLowerCase()}CooldownFormatted`] = `Next ${key} in ${Math.floor(cooldown / 3600000)} hours ` + 
                                                                `and ${Math.floor((cooldown % 3600000) / 60000)} minutes`;
            } else {
                reply[`${key.toLowerCase()}CooldownFormatted`] = `${key} Ready!`;
            }
        }
 
        return reply;
    },

    setCooldown: async function(user, cooldownType, cooldown) {
        /* cooldownType: "pull", "drop", "daily"
         * cooldown: time in milliseconds
         */
        let newCooldown = new Date(new Date().getTime() + cooldown);
        user[`next${cooldownType[0].toUpperCase() + cooldownType.slice(1)}`] = newCooldown;
        await user.save();
    },

    getPermissionLevel: async function(user) {
        /* THIS FUNCTION EXPECTS A DISCORD USER INSTANCE!  
        * Returns the permission level of the user
        * 0 - no permissions
        * 1 - guild permissions
        * 2 - admin permissions
        */
        let guild = await Guild.findOne({
            where: {
                guildId: user.guild.id
            }
        });

        //Global Admin
        let adminIDs = await GeneralUtils.getBotProperty("adminIDs");
        if (adminIDs.includes(user.id)) {
            return 2;
        }
        
        //Guild Admin if role is present
        if(user._roles.includes(String(guild.adminRoleId))) {
            return 1;
        }
        //or if user is owner
        if(user.guild.ownerId === user.id) {
            return 1;
        }

        //Regular User
        return 0;
    }
}
