const { Bot } = require("../models");

module.exports = {
    name: "GeneralUtils",
    getBotProperty: async function(property) {
        let bot = await Bot.findOne();
        return property ? bot[property] : bot;
    }
}
