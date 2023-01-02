const { Bot } = require("../models");
const crypto = require("crypto");
const { ReactionUserManager } = require("discord.js");

module.exports = {
    name: "GeneralUtils",
    getBotProperty: async function(property) {
        let bot = await Bot.findOne();
        return property ? bot[property] : bot;
    },

    setBotProperty: async function(property, value) {
        let bot = await Bot.findOne();
        bot[property] = value;
        await bot.save();
    },

    generateLogID: async function() {
        return crypto.randomBytes(4).toString("hex");
    }
}
