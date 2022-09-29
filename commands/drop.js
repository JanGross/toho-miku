const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, AttachmentBuilder } = require("discord.js");
const { Card, User, Character, DropHistory, sequelize } = require("../models");
const { customAlphabet } = require("nanoid");
const { CardUtils, UserUtils, ReplyUtils, GeneralUtils, Rendering } = require("../util");
const { QUALITY } = require("../config/constants");
const card = require("../models/card");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("drop")
    .setDescription("Drop a card"),
    permissionLevel: 0,
    async execute(interaction) {
        await interaction.deferReply();
        const user = await UserUtils.getUserByDiscordId(interaction.member.id);
        
        let permissionLevel = await UserUtils.getPermissionLevel(interaction.member);
        const cooldowns = await UserUtils.getCooldowns(user);
        if (cooldowns.dropCooldown > 0 && permissionLevel < 2) {
            interaction.editReply({
                content: `You can't drop a card yet! ${cooldowns.dropCooldownFormatted}`,
                ephemeral: false
            });
            return;
        }
        
        //Generate 3 cards, each is persisted with an initial userId of NULL
        const cards = [];
        let characters = await Character.findAll({
            where: {
                enabled: true
            },
            order: sequelize.random(),
            limit: 3
        });

        for (let i = 0; i < 3; i++) {
            //generate quality based on drop rate
            let quality = undefined;
            let roll = Math.random() * 100;
            if (roll <= 45.0) {
                quality = QUALITY.BAD; //45%
            }
            if (roll > 45.0) {
                quality = QUALITY.OK; //25%
            }
            if (roll > 70.0) {
                quality = QUALITY.GOOD; //15%
            }
            if (roll > 85.0) {
                quality = QUALITY.GREAT; //10%
            }
            if (roll > 95.0) {
            quality = QUALITY.EXCELLENT; //5%
            }
            if (roll > 99.9) {
                quality = QUALITY.SHINY; //0.1%
            }

            //get number of characters in database
            const characterId = characters[i].id
            console.log(`characterId: ${characterId}`);
            //random number between 1 and 6
            let newCard = await Card.create({
                characterId: characterId,
                identifier: CardUtils.generateIdentifier(),
                quality: quality,
                printNr: await CardUtils.getNextPrintNumber(characterId),
                
            });
            cards.push(newCard);
        }

        cards.sort((a, b) => a.characterId - b.characterId);
        
        const row = new ActionRowBuilder();
        let deckImage = await Rendering.renderCardStack(cards);
        let notableProps = [];
        for (let i = 0; i < cards.length; i++) {
            //Add claim button and notable prop text for each card
            row.addComponents(
				new ButtonBuilder()
					.setCustomId(`claim-${i}-${cards[i].identifier}`)
					.setLabel(`Claim  ${i+1}`)
					.setStyle(ButtonStyle.Primary),
			);
            if (cards[i].quality == QUALITY.SHINY) {
                notableProps.push(`<a:sparklu:1019505245572837428>`);
            }
            if (cards[i].printNr == 1) {
                notableProps.push(`📦`);
            }
        }
        //add 10 experience to the user
        await user.addExperience(10, 'drop');

        const file = new AttachmentBuilder(deckImage);
    
        const message = await interaction.editReply({ content: `${interaction.member} Dropped 3 cards.\n${notableProps.join(" ")}`, components: [row], files: [file], fetchReply: true });

        let dropHistory = {
            dropper: user.id,
            guild: interaction.guild.id,
            channel: interaction.channel.id,
            messageId: message.id,
        };
        for (let card of cards) {
            let historyEntry = {
                cardData: JSON.stringify(card)
            };
            dropHistory[card.identifier] = historyEntry;   
        }

        //create new drop history entry
        let history = await DropHistory.create({
            dropData: JSON.stringify(dropHistory),
            type: 0
        });

		//const message = await interaction.editReply({ content: reply, components: [row], fetchReply: true });
        //set users drop cooldown
        await UserUtils.setCooldown(user, "drop", await GeneralUtils.getBotProperty("dropTimeout"));

        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 25000 });
        
        let collectionReplies = [];
        collector.on('collect', async i => {
            let cardId = i.customId.split("-")[1];
            if (await cards[cardId].userId) { i.reply({ content: "This card has already been claimed!", ephemeral: true }); return; }

            let claimUser = await UserUtils.getUserByDiscordId(i.user.id);
            let cooldowns = await UserUtils.getCooldowns(claimUser);
            let permissionLevel = await UserUtils.getPermissionLevel(i.member);
            if (cooldowns.pullCooldown > 0 && permissionLevel < 2) {
                i.reply({
                    content: `You can't claim a card yet! ${cooldowns.pullCooldownFormatted}`,  
                    ephemeral: false
                });
                return;
            }

            if (claimUser) {
                //Update card with the user id
                cards[cardId].userId = claimUser.id;
                await UserUtils.setCooldown(claimUser, "pull", await GeneralUtils.getBotProperty("pullTimeout"));
                await cards[cardId].save();
                let historyEntry = {
                    userId: claimUser.id,
                    cardId: cards[cardId].id,
                    dropMessageId: message.id
                }
                await DropHistory.create({
                    dropData: JSON.stringify(historyEntry),
                    type: 1
                });
                await claimUser.addExperience(5, "claim");
                //fetch character name from database given the character id
                let character = await Character.findOne({
                    attributes: ["name"],
                    where: {
                        id: cards[cardId].characterId
                    }
                });
                let reply = await i.reply({ content: `${i.user} (${claimUser.id}) claimed a card!  [${cards[cardId].identifier}]`, ephemeral: false, fetchReply: true  });
                collectionReplies.push({ ref: reply, characterName: character.name, card: cards[cardId] });
                let newRow = ReplyUtils.recreateComponents(i.message.components);
                newRow.components[cardId].setLabel("Claimed");
                newRow.components[cardId].setStyle(ButtonStyle.Success);
                newRow.components[cardId].setDisabled(true);
                //let deckImage = await Rendering.renderCardStack(cards);
                message.edit({ components: [newRow] });
            }
        });
        
        collector.on('end', async collected => {
            for (let card of cards) {
                if (!card.userId) {
                    card.userId = 1;
                    await card.save();
                }
            }
            for (reply of collectionReplies) {
                //TODO: strings shouldn't be inlined. Needs refactoring
                let notableProps = [];
                if (reply.card.printNr == 1) notableProps.push("📦 First Print");
                if (reply.card.quality == 6) notableProps.push("<a:sparklu:1019505245572837428> Shiny");

                reply.ref.edit({ content: `${reply.ref.content.replace('a card', reply.characterName)} ${notableProps.join()}` });
            }
            console.log(`Collected ${collected.size} interactions.`);

            
            let deckImage = await Rendering.renderCardStack(cards);
            message.edit({ components: [], files: [new AttachmentBuilder(deckImage)] });
        });
        
    }
}