const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Card, User } = require("../models");
const { UserUtils, CardUtils } = require("../util");
const { TradeStore } = require("../stores");

const tradeTimeout = 90000;
module.exports = {
    data: new SlashCommandBuilder()
            .setName("trade")
            .setDescription("Start trading with a User")
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("start")
                    .setDescription("Start a trade with a User")
                    .addUserOption((option) =>
                        option
                            .setName("user")
                            .setDescription("User to trade with")
                            .setRequired(true)
                        ))
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("view")
                    .setDescription("View active trade")
                )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("add")
                    .setDescription("Add a card to the trade")
                    .addStringOption((option) =>
                        option
                            .setName("card")
                            .setDescription("Card to add")
                            .setRequired(true)
                            .setAutocomplete(true)
                        )
                    ),
    permissionLevel: 0,
    async execute(interaction) {
        let user1 = await UserUtils.getUserByDiscordId(interaction.member.id);
        let trade = await TradeStore.getTradeByUser(user1.id);

        switch (interaction.options.getSubcommand()) {
            case "start":
                await interaction.deferReply();
                let user2 = await UserUtils.getUserByDiscordId(interaction.options.getUser("user").id);
                //Attach usernames for convenience
                user2.name = interaction.options.getUser("user").username;
                user1.name = interaction.member.user.username;
                this.startTrade(interaction, user1, user2);
                break;
            case "view":
                await interaction.deferReply();
                this.viewTrade(interaction, trade);
                break;
            case "add":
                if (!trade) {
                    await interaction.reply({ content: "You don't have an active trade", ephemeral: true });
                    return;
                }
                await interaction.deferReply();
                let card = await Card.findOne({ 
                    where: 
                        { identifier: interaction.options.getString("card") , userId: user1.id } 
                    },
                    include: [
                        { model: Character, include: [{ model: Band }] },
                        { model: User}
                    ]);
                this.addCardToTrade(interaction, trade, card);
                break;
        }
    },
    
    async startTrade(interaction, user1, user2) {
        if (!user2) {
            await interaction.editReply({ content: "This User is not registered yet!" });
            return;
        }
        if (user2.discordId === interaction.member.id) {
            await interaction.editReply({ content: "You can't trade with yourself!" });
            return;
        }
        if (await TradeStore.getTradeByUser(user1.id)) {
            await interaction.editReply({ content: "You are already in a Trade!" });
            return;
        }
        if (await TradeStore.getTradeByUser(user2.id)) {
            await interaction.editReply({ content: "This User is already in a Trade!" });
            return;
        }
        let trade = new TradeStore.Trade(CardUtils.generateIdentifier(), user1, user2);
        await TradeStore.addTrade(trade);
        this.viewTrade(interaction, trade);
        

    },
    
    async addCardToTrade(interaction, trade, card) {
        //find card by identifier if owned by user
        
        if (!card) {
            await interaction.reply({ content: "You don't own this card", ephemeral: true });
            return;
        }
        if (card.userId !== trade.user1.id) {
            await interaction.editReply({ content: "You don't own this Card!" });
            return;
        }

        if (trade.user1.id === interaction.member.id) {
            trade.user1Cards.push(card);
        } else {
            trade.user2Cards.push(card);
        }
        this.viewTrade(interaction, trade);
    },

    async viewTrade(interaction, trade) {
        if (!trade) {
            await interaction.editReply({ content: "This Trade does not exist!" });
            return;
        }
        //delete existing trade message
        if (trade.embed) {
            await trade.embed.delete();
        }

        let user1Cards = "No cards"
        let user2Cards = "No cards"
        // for each of user1's cards in the trade
        for (card of trade.user1Cards) {
            //get the card object
            let card = await Card.findOne({
                where: {
                    identifier: cardIdentifier
                },
                include: [
                    { model: Character, include: [{ model: Band }] },
                    { model: User}
                ]
            });
            //add it to the list
            user1Cards += `${card.identifier}\n`;
        }
        // for each of user2's cards in the trade
        for (card of trade.user2Cards) {
            //get the card object
            let card = await Card.findOne({
        const embed = new EmbedBuilder()
            .setTitle(`Trade [${trade.id}] ${trade.user1.name} with ${trade.user2.name}`)
            .setDescription("DUMMY DESCRIPTION")
            .addFields(
                { name: `${trade.user1.name}'s cards`, value: user1Cards },
                { name: `${trade.user2.name}'s cards`, value: `DATA2` }
            )
            .setColor(0x00ff00)
            .setFooter({ text: `TRADE`, iconURL: 'https://cdn.discordapp.com/attachments/856904078754971658/1017431187234508820/fp.png' });
        
        const row = new ActionRowBuilder();
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`cancel-trade-${trade.id}`)
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger)
        );
        let reply = await interaction.editReply({ embeds: [embed], components: [row] });
        trade.embed = reply;

        //button collector
        const filter = (button) => button.user.id === trade.user1.discordId || button.user.id === trade.user2.discordId;
        const collector = reply.createMessageComponentCollector({ filter, time: tradeTimeout });

        collector.on('collect', async (button) => {
            if (button.customId === `cancel-trade-${trade.id}`) {
                await TradeStore.removeTrade(trade);
                collector.stop("cancel");
            }
        });

        collector.on('end', async (collected, reason) => {
            console.log(`Collected ${collected.size} items, reason: ${reason}`);
            if (reason === "time") {
                await TradeStore.removeTrade(trade);
                await trade.embed.edit({ content: `Trade ${trade.id} expired`, embeds: [], components: [] });
            }
            if (reason === "cancel") {
                await trade.embed.edit({ content: `Trade ${trade.id} cancelled`, embeds: [], components: [] });
            }
        });

    }
}