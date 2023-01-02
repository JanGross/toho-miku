const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Card, User, Character } = require("../models");
const { UserUtils, CardUtils, DbUtils, GeneralUtils } = require("../util");
const { TradeStore } = require("../stores");

const tradeExpiry = 920000; //When an active trade expires automatically
const tradeTimeout = 120000; //Time until user can start a new trade
const db = DbUtils.getDb();

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
        await interaction.deferReply();
        let user1 = await UserUtils.getUserByDiscordId(interaction.member.id);
        let trade = await TradeStore.getTradeByUser(user1.id);

        switch (interaction.options.getSubcommand()) {
            case "start":
                let user2 = await UserUtils.getUserByDiscordId(interaction.options.getUser("user").id);
                if (!user2) {
                    await interaction.editReply({ content: "You can't trade with an unregistered user!" });
                    return;
                }
                //Attach usernames for convenience
                user2.name = interaction.options.getUser("user").username;
                user1.name = interaction.member.user.username;
                this.startTrade(interaction, user1, user2);
                break;
            case "view":
                this.viewTrade(interaction, trade);
                break;
            case "add":
                if (!trade) {
                    await interaction.editReply({ content: "You don't have an active trade", ephemeral: true });
                    return;
                }
                let card = await Card.findOne({ 
                    where: 
                        { identifier: interaction.options.getString("card") , userId: user1.id } 
                    ,
                    include: [
                        { model: Character },
                        { model: User}
                    ]}
                );
                this.addCardToTrade(interaction, trade, card);
                break;
        }
    },
    
    async startTrade(interaction, user1, user2) {
        //user1 is the user who started the trade, user2 is the user who is being traded with
        if (!user2) {
            await interaction.editReply({ content: "This User is not registered yet!" });
            return;
        }
        if (user2.discordId === interaction.member.id) {
            await interaction.editReply({ content: "You can't trade with yourself!" });
            return;
        }

        let user1Trade = await TradeStore.getTradeByUser(user1.id);
        if (user1Trade) {
            if (user1Trade.state <= 1) {
                await interaction.editReply({ content: "You are already in a Trade!" });
                return;
            }
            //If the initiating user still has a finished or cancelled trade in store, he's on a timeout
            if (user1Trade.state >= 2 && user1Trade.user1.id === user1.id) {
                await interaction.editReply({ content: `You need to wait ${tradeTimeout / 1000 / 60 } minutes before staring a new trade` });
                return;
            }
        }
        let user2Trade = await TradeStore.getTradeByUser(user2.id);
        if (user2Trade) {
            await interaction.editReply({ content: `This User is ${(user2Trade.state <= 1 ) ? "already in a trade" : "on cooldown!" }` });
            return;
        }
        let trade = new TradeStore.Trade(CardUtils.generateIdentifier(), user1, user2);
        await TradeStore.addTrade(trade);
        this.viewTrade(interaction, trade);
        

    },
    
    async addCardToTrade(interaction, trade, card) {
        //find card by identifier if owned by user
        
        if (!card) {
            await interaction.editReply({ content: "You don't own this card", ephemeral: true });
            return;
        }

        if (trade.user1.id === card.userId) {
            trade.user1Cards.push(card);
        }
        if (trade.user2.id === card.userId) {
            trade.user2Cards.push(card);
        }

        await interaction.editReply({ content: `User ${interaction.member.user.username} added ${card.identifier} to the trade` });
        await this.viewTrade(interaction, trade);
    },

    async viewTrade(interaction, trade) {
        if (!trade) {
            await interaction.editReply({ content: "No active Trade" });
            return;
        }

        let user1Cards = "";
        let user2Cards = "";

        // for each of user1's cards in the trade
        for (card of trade.user1Cards) {
            let cardStr = CardUtils.getShortString(card);
            user1Cards += `\n${cardStr}`;
        }
        // for each of user2's cards in the trade
        for (card of trade.user2Cards) {
            let cardStr = CardUtils.getShortString(card);
            user2Cards += cardStr;
        }

        let color = 0xff000c;
        let tradeLocked = trade.user1Locked && trade.user2Locked;
        let tradeAccepted = trade.user1accepted && trade.user2accepted;

        if (trade.state === TradeStore.States.LOCKED) {
            //color orange
            color = 0xffa500;
        }

        if (trade.state === TradeStore.States.ACCEPTED) {
            //color green
            color = 0x00ff00;
        }

        if (trade.state == TradeStore.States.CANCELLED || trade.state == TradeStore.States.EXPIRED) {
            //color red
            color = 0xff0000;
        }

        const embed = new EmbedBuilder()
            .setTitle(`Trade [${trade.id}] ${trade.user1.name} with ${trade.user2.name}`)
            .setDescription("DUMMY DESCRIPTION")
            .addFields(
                { name: `${trade.user1.name}'s cards ${trade.user1Locked ? '🔒 Locked' : '🔓'}`, value: user1Cards || "No cards" },
                { name: `${trade.user2.name}'s cards ${trade.user2Locked ? '🔒 Locked' : '🔓'}`, value: user2Cards || "No cards" }
            )
            .setColor(color)
            .setFooter({ text: `TRADE`, iconURL: 'https://cdn.discordapp.com/attachments/856904078754971658/1017431187234508820/fp.png' });
        
        let row = new ActionRowBuilder();
        row = this.addComponentsToRow(row, trade);

        let reply;
        if (trade.embed) {
            reply = await trade.embed.edit({ embeds: [embed], components: [row] });
            return;
        } else {
            reply = await interaction.editReply({ embeds: [embed], components: [row] });
            await this.attachCollectors(trade, reply, interaction);
        }
        
        trade.embed = reply;
    },

    addComponentsToRow(row, trade) {
        //Anything before State.ACCEPTED can still be cancelled
        if (trade.state < TradeStore.States.ACCEPTED) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`cancel-trade-${trade.id}`)
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
            );
        }

        //Anything before State.LOCKED can still be locked
        if (trade.state < TradeStore.States.LOCKED) {
            row.addComponents(
                new ButtonBuilder()
                .setCustomId(`lock-trade-${trade.id}`)
                .setLabel('Lock')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🔒')
            );
        }

        let acceptCount = 0;
        if (trade.user1accepted) {
            acceptCount++;
        }
        if (trade.user2accepted) {
            acceptCount++;
        }

        //Only trades in state locked can be accepted
        if (trade.state === TradeStore.States.LOCKED) {
            row.addComponents(
                new ButtonBuilder()
                .setCustomId(`accept-trade-${trade.id}`)
                .setLabel(`Accept (${acceptCount}/2)`)
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅')
            );
        }

        //if trade is accepted, add a button to finalize it
        if (trade.state === TradeStore.States.ACCEPTED) {
            row.addComponents(
                new ButtonBuilder()
                .setCustomId(`trade-completed-${trade.id}`)
                .setLabel('Completed')
                .setStyle(ButtonStyle.Success)
                .setDisabled(true)
            );
        }

        //if trade is cancelled, add a button to finalize it
        if (trade.state === TradeStore.States.CANCELLED) {
            row.addComponents(
                new ButtonBuilder()
                .setCustomId(`trade-cancelled-${trade.id}`)
                .setLabel('Cancelled')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true)
            );
        }

        //if trade is expired, add a button to finalize it
        if (trade.state === TradeStore.States.EXPIRED) {
            row.addComponents(
                new ButtonBuilder()
                .setCustomId(`trade-expired-${trade.id}`)
                .setLabel(`Expired after ${tradeExpiry / 1000 / 60} minutes`)
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true)
            );
        }

        return row;
    },

    async attachCollectors(trade, reply, interaction) {
        //button collector
        const filter = (button) => button.user.id === trade.user1.discordId || button.user.id === trade.user2.discordId;
        const collector = reply.createMessageComponentCollector({ filter, time: tradeExpiry });

        collector.on('collect', async (button) => {
            //if interaction member is neither user1 nor user2, ignore
            if (button.user.id !== trade.user1.discordId && button.user.id !== trade.user2.discordId) {
                return;
            }

            if (button.customId === `cancel-trade-${trade.id}`) {
                button.deferUpdate();
                collector.stop("cancel");
            }
            if (button.customId === `lock-trade-${trade.id}`) {
                //if interaction member is user1
                if (button.user.id === trade.user1.discordId) {
                    trade.user1Locked = true;
                }
                //if interaction member is user2
                
                if (button.user.id === trade.user2.discordId) {
                    trade.user2Locked = true;
                }

                if (trade.user1Locked && trade.user2Locked) {
                    trade.state = TradeStore.States.LOCKED;
                }
                await button.deferUpdate();
                await this.viewTrade(interaction, trade);
            }
            if (button.customId === `accept-trade-${trade.id}`) {
                //if interaction member is user1
                if (button.user.id === trade.user1.discordId) {
                    trade.user1accepted = true;
                }
                //if interaction member is user2
                
                if (button.user.id === trade.user2.discordId) {
                    trade.user2accepted = true;
                }

                if (trade.user1accepted && trade.user2accepted) {
                    collector.stop("accepted");
                    trade.state = TradeStore.States.ACCEPTED;
                    await this.transactCards(trade, interaction);
                }

                await button.deferUpdate();
                await this.viewTrade(interaction, trade);
            }
        });

        collector.on('end', async (collected, reason) => {
            console.log(`Collected ${collected.size} items, reason: ${reason}`);
            if (reason === "time") {
                trade.state = TradeStore.States.EXPIRED;
            }
            if (reason === "cancel") {
                trade.state = TradeStore.States.CANCELLED;
            }
            if (reason === "accepted") {
                trade.state = TradeStore.States.ACCEPTED;
            }
            await this.viewTrade(interaction, trade);
            await this.endTrade(trade);
        });
    },

    async transactCards(trade, interaction) {
        try {
            const result = await db.sequelize.transaction(async (trx) => {
                //check and update user1 cards
                for (let i = 0; i < trade.user1Cards.length; i++) {
                    const card = trade.user1Cards[i];
                    let result = await Card.update(
                        { userId: trade.user2.id },
                        { where: { id: card.id, userId: trade.user1.id } },
                        { transaction: trx }
                    )
                    if (result[0] == 0) {
                        await interaction.channel.send(`Card ${card.id} is not owned by ${trade.user1.discordId}! That's not supposed to happen, transaction rolled back!`);
                        trx.rollback();
                        throw new Error(`Card ${card.id} is not owned by ${trade.user1.discordId}!`);
                    }
                }
                //check and update user1 cards
                for (let i = 0; i < trade.user2Cards.length; i++) {
                    const card = trade.user2Cards[i];
                    let result = await Card.update(
                        { userId: trade.user1.id },
                        { where: { id: card.id, userId: trade.user2.id } },
                        { transaction: trx }
                    )
                    if (!result) {
                        await interaction.channel.send(`Card ${card.id} is not owned by ${trade.user2.discordId}! That's not supposed to happen, transaction rolled back!`);
                        trx.rollback();
                        throw new Error(`Card ${card.id} is not owned by ${trade.user2.discordId}!`);
                    }
                }

            });
        } catch (error) {
            let logID = await GeneralUtils.generateLogID();
            console.log(`[${logID}] ${error} : ${error.stack}`);
            await interaction.channel.send(`Transaction failed! Please contact an admin with log ID ${logID}!`);
        }
    },
    async endTrade(trade) {
        setTimeout(async () => {
            await TradeStore.removeTrade(trade);
        }, tradeTimeout);
    }
}