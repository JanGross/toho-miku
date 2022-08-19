const { SlashCommandBuilder, ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder } = require("discord.js");
const { GeneralUtils, GuildUtils } = require("../util");

module.exports = {
    data: new SlashCommandBuilder()
            .setName("settings")
            .setDescription("Change Guild Settings"),
    permissionLevel: 1,

    async execute(interaction) {
        let reply = "Guild settings:\n";
        const row = new ActionRowBuilder();
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`set-admin-role`)
                .setLabel('Set Admin Role')
                .setStyle(ButtonStyle.Primary)
        );
        const message = await interaction.reply({ content: reply, components: [row], fetchReply: true });

        const filter = (m) => m.author.id === message.author.id;
        const collector = message.createMessageComponentCollector(filter, { componentType: ComponentType.Button, time: 120000 });

        //BUGBUG: end callback does not trigger
        collector.on('end', collected => {
            console.log(`Collected ${collected.size} interactions.`);
            message.edit({ components: [] });
        });
        
        collector.on('collect', async m => {
            switch (m.customId) {
            case 'set-admin-role':
                //Build select menu with every role in the guild
                const row = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('select')
                            .setPlaceholder('Nothing selected')
                            .addOptions(
                                m.guild.roles.cache.map(role => ({
                                    label: role.name,
                                    description: role.id, 
                                    value: role.id
                                }))
                            ),
                    );
                const message = await m.reply({ content: 'Select a role', components: [row], fetchReply: true });

                const filter = (m) => m.author.id === message.author.id;
                const replyCollector = message.createMessageComponentCollector(filter, { componentType: ComponentType.SelectMenu, time: 25000 });
                replyCollector.on('collect', async r => {
                    const role = m.guild.roles.cache.find(role => role.id === r.values[0]);
                    m.deleteReply(); //Delete select menu message
                    GuildUtils.setProperty(m.guild.id, 'adminRoleId', role.id);
                    r.reply({ content: `Selected role: ${role.name} \n(${role.id})`, components: [] });
                });    
                break;
            }
        });
    }
}