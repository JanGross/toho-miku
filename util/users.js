const { User, Guild } = require("../models");
const GeneralUtils = require("./general");
const { PATREON } = require("../config/constants");

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

    getCooldowns: async function(user, tier) {
        /* Returns an object with the following properties:
            * now: the current time in milliseconds
            * nextClaimReset: time in milliseconds until the claims are reset
            * remainingClaims: amount of claims remaining
            * nextDropReset: time in milliseconds until the drops are reset
            * remainingDrops: amount of claims remaining
            * nextDaily: time in milliseconds until the next /daily can be used
        */

        const cooldownKeys = ["nextClaimReset", "nextDropReset"]

        let reply = {
            now: new Date().getTime()
        };

        //Claims
        reply['nextClaimReset'] = Math.max(user['nextClaimReset'].getTime() - reply['now'], 0);
        
        //No remamning claims but reset reached
        if (user['remainingClaims'] <= 0 && reply['nextClaimReset'] <= 0) {
            user['remainingClaims'] = 1 + (tier ? PATREON.tiers[tier].modifiers.claims : 0);
        }
        reply['remainingClaims'] = user['remainingClaims'];
        
        //Drops
        reply['nextDropReset'] = Math.max(user['nextDropReset'].getTime() - reply['now'], 0);
        //No remamning claims but reset reached
        if (user['remainingDrops'] <= 0 && reply['nextDropReset'] <= 0) {
            user['remainingDrops'] = 1 + (tier ? PATREON.tiers[tier].modifiers.drops : 0);
        }
        reply['remainingDrops'] = user['remainingDrops'];

        //Daily
        reply['nextDaily'] = Math.max(user['nextDaily'].getTime() - reply['now'], 0);
        reply['nextDailyTStamp'] = user['nextDaily'].getTime();

        reply[`nextDailyFormatted`] = reply['nextDaily'] > 0 ? `<t:${parseInt(reply['nextDailyTStamp'] / 1000)}:R>` : `Ready!`;
        for (key of cooldownKeys) {
            let cooldown = reply[key];
            reply[`${key}Timestamp`] = user[key].getTime();
            reply[`${key}Formatted`] = cooldown > 0 ? `<t:${parseInt(reply[`${key}Timestamp`] / 1000)}:R>` : `Ready!`;
        }
        
        //Persists any potential resets
        await user.save();
        return reply;
    },

    actionHandler: async function(user, actionType) {
        /* 
         * cooldownType: "claim", "drop", "daily"
         * user: native user object        
         */
        console.log(`PROCESSING ACTION HANDLER: ${actionType} for user ${user.id}`);
        switch (actionType) {
            case "drop":
                user['remainingDrops'] -= 1
                if (user['remainingDrops'] <= 0) {
                    let dropTimeout = await GeneralUtils.getBotProperty("dropTimeout");
                    
                    user['nextDropReset'] = new Date(new Date().getTime() + dropTimeout);
                }
                console.log(`Drop for user ${user.id} persisting with value ${user['remainingDrops']} next drop at ${user['nextDropReset']}`);
                await user.save();
                break;
            case "claim":
                user['remainingClaims'] -= 1
                if (user['remainingClaims'] <= 0) {
                    let claimTimeout = await GeneralUtils.getBotProperty("claimTimeout");
                    
                    user['nextClaimReset'] = new Date(new Date().getTime() + claimTimeout);
                }
                console.log(`Claim for user ${user.id} persisting with value ${user['remainingClaims']} next claim at ${user['nextClaimReset']}`);
                await user.save();
                break;
            case "daily":
                let dailyTimeout = 86400000; //24 Hours
                user['nextDaily'] = new Date(new Date().getTime() + dailyTimeout);
                await user.save();
                break;
            default:
                break;
        }
    },

    setCooldown: async function(user, cooldownType, cooldown) {
        /* cooldownType: "claim", "drop"
         * cooldown: time in milliseconds
         */
        let newCooldown = new Date(new Date().getTime() + cooldown);
        user[`next${cooldownType[0].toUpperCase() + cooldownType.slice(1)}Reset`] = newCooldown;
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
    },

    getPatreonPerks: async function(client, user) {
        /** Returns the users highest Patreon tier and its associated perks
         * client: Discord client instance available via interaction.client
         * user: Native user instance
         * 
         * returns
         * tier: 0 if not subscribed
         *      1-n as per role mapping in the DB (e.g. {"1083018874263453868":1,"1083018984921759744":2})
         * perks: modifiers associated with the tier 
         *   modifiers: {
         *       drops: 0,
         *       claims: 1,
         *       [...]
         *   }
         */

        let patreonRoles = await GeneralUtils.getBotProperty("patreonTierRoles");
        patreonRoles = JSON.parse(patreonRoles);
        const guild = await client.guilds.fetch(PATREON.roleServer);
        const guildMember = await guild.members.fetch(user.discordId);
        let highestRole = 0;
        for (const [role, tier] of Object.entries(patreonRoles)) {
            const matchedRole = guildMember.roles.cache.get(role);
            if(matchedRole) {
                highestRole = Math.max(highestRole, tier);
            }
        }            
        let perks = PATREON.tiers[highestRole];
        return { "tier": highestRole, "perks": perks };
    }
}
