const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");

module.exports = {
    name: "ReplyUtils",
    recreateComponents: function(components) {
        console.log("Recreating components");
        let newComponents = [];
        for (let i = 0; i < components.length; i++) {
            let row = new ActionRowBuilder();
            for (let j = 0; j < components[i].components.length; j++) {
                console.log(components[i].components[j]);
                console.log(`Recreating button ${components[i].components[j].customId}`);
                let button = new ButtonBuilder();
                button.setCustomId(components[i].components[j].customId);
                button.setLabel(components[i].components[j].label);
                button.setStyle(components[i].components[j].style);
                if (components[i].components[j].emoji) {
                    button.setEmoji(components[i].components[j].emoji);
                }
                if (components[i].components[j].disabled) {
                    button.setDisabled(components[i].components[j].disabled);
                }
                row.addComponents(button);
            }
            newComponents.push(row);
        }
        return newComponents;
    },
}
