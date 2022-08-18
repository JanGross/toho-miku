const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { customAlphabet } = require("nanoid");

module.exports = {
    data: new SlashCommandBuilder()
            .setName("debug")
            .setDescription("debug feature")
            .addStringOption((option) =>
                option
                    .setName("feature")
                    .setDescription("The command to debug")
                    .setRequired(true)
                ),

    async execute(interaction) {
        const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('primary')
					.setLabel('Primary')
					.setStyle(ButtonStyle.Primary),
			);

		await interaction.reply({ content: 'Pong!', components: [row] });
        return;
        switch (interaction.options.getString("feature")) {
        case "ping":
            interaction.reply({
                content: "Pong!",
                ephemeral: true
            });
            break;
        case "ids":
            const nanoid = customAlphabet('6789BCDFGHJKLMNPQRTW',6);
            const ids = [];
            for (let i = 0; i < 100; i++) {
                console.log(nanoid());
                ids.push(nanoid());
            }
            interaction.reply({
                content: `${JSON.stringify(ids)}`,
                ephemeral: false
            });
            break;
        }
    }
}