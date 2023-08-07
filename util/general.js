const { Bot } = require("../models");
const crypto = require("crypto");
const { ReactionUserManager } = require("discord.js");
const axios = require("axios");
const fs = require("fs");

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
    },

    formatNumber: function(num, precision = 1) {
        const map = [
          { suffix: 'T', threshold: 1e12 },
          { suffix: 'B', threshold: 1e9 },
          { suffix: 'M', threshold: 1e6 },
          { suffix: 'K', threshold: 1e3 },
          { suffix: '', threshold: 1 },
        ];
      
        const found = map.find((x) => Math.abs(num) >= x.threshold);
        if (found) {
          const formatted = (Math.floor((num / found.threshold)*10) / 10) + found.suffix;
          return formatted;
        }
      
        return num;
    },

    downloadFile: async function(url, path) {
        let imageBuffer = await axios.get(url, { responseType: 'arraybuffer' });
        fs.writeFileSync(path, imageBuffer.data);
    },
}
