const sharp = require('sharp');
const { SlashCommandBuilder,  AttachmentBuilder, EmbedBuilder  } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
            .setName("debugrendering")
            .setDescription("Debug rendering"),
    permissionLevel: 2,
    async execute(interaction) {
        
        const image = await sharp({
                create: {
                width: 900,
                height: 500,
                channels: 4,
                background: { r: 255, g: 0, b: 0, alpha: 0.5 }
                }
             })
            .composite([
                { input: './assets/cards/test/test.png', gravity: 'northwest' },
                { input: './assets/cards/test/test.png', gravity: 'centre' },
                { input: './assets/cards/test/test.png', gravity: 'northeast' },
                { input: './assets/overlays/rainbow_overlay.png', gravity: 'northwest' },
                { input: './assets/overlays/rainbow_overlay.png', gravity: 'centre' },
                { input: './assets/overlays/rainbow_overlay.png', gravity: 'northeast' },
            ])
            .png()
            .toBuffer();
        
        const file = new AttachmentBuilder(image);
        const message = await interaction.reply({ content: 'asd', files: [file], fetchReply: true });
    }
}