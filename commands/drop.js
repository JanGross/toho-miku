const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, AttachmentBuilder } = require("discord.js");
const { Card, User, Character, DropHistory, Wishlist, sequelize } = require("../models");
const { customAlphabet } = require("nanoid");
const { CardUtils, UserUtils, ReplyUtils, GeneralUtils, Rendering } = require("../util");
const { QUALITY, PATREON } = require("../config/constants");
const Sequelize = require('sequelize');
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
        const cooldowns = await UserUtils.getCooldowns(user, (await UserUtils.getPatreonPerks(interaction.client, user))['tier']);

        //Can't drop if no drops remain    nextReset hasn't been reached   User is not a global admin
        if (cooldowns.remainingDrops <= 0 && cooldowns.nextDropReset > 0 && permissionLevel < 2) {
            interaction.editReply({
                content: `You can't drop a card yet! \nReset in ${cooldowns.nextDropResetFormatted}`,
                ephemeral: false
            });
            return;
        }

        await UserUtils.actionHandler(user, "drop");
        
        //Generate 3 cards, each is persisted with an initial userId of NULL
        const cards = [];
        let characters = await Character.findAll({
            where: {
                enabled: true,
                groupId: { [Sequelize.Op.not] : PATREON.customsGID }
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
        let deckImage = await Rendering.renderCardStack(cards).catch(async err => {
            await interaction.channel.send(`Uooh an error! ${err.response?.status} ${err.response?.statusText} \n ${err.response?.data.message} \n ${err.response?.data.jobId}`);
        });
        if (!deckImage) { return; }
        
        let notableProps = [];
        let pings = [];
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

            //send wishlist pings
            let guildMembers  = [...(await interaction.guild.members.fetch()).keys()];
            let wishlists = await Wishlist.findAll({
                attributes: ['id', 'UserId'],
                include: [{
                    model: Character,
                    attributes: ['name'],
                    where: { id: cards[i].characterId },
                },
                {
                    model: User,
                    attributes: ['discordId', 'wishlistPing']
                }]
            });
            wishlists = wishlists.filter(wishlist => wishlist.User.wishlistPing);
            wishlists.forEach(wishlist => {
                if(wishlist.User.wishlistPing && guildMembers.includes(wishlist.User.discordId)) {
                    pings.push(`<@${wishlist.User.discordId}>`);
                }
            });
            if (wishlists.length > 0) {
                let character = wishlists[0].Characters[0];
                pings.push(`your wishlisted character ${character.name} is in this drop!\n`);
            }
        }
        //add 10 experience to the user
        await user.addExperience(10, 'drop');

        const file = new AttachmentBuilder(deckImage);
    
        const message = await interaction.editReply({ content: `${interaction.member} Dropped 3 cards.\n${notableProps.join(" ")} \n${pings.join(' ')}`, components: [row], files: [file], fetchReply: true });

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


        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });
        
        let collectionReplies = [];
        collector.on('collect', async i => {
            let cardId = i.customId.split("-")[1];
            if (await cards[cardId].userId) { i.reply({ content: "This card has already been claimed!", ephemeral: true }); return; }

            let claimUser = await UserUtils.getUserByDiscordId(i.user.id);
            let cooldowns = await UserUtils.getCooldowns(claimUser, (await UserUtils.getPatreonPerks(interaction.client, claimUser))['tier']);
            let permissionLevel = await UserUtils.getPermissionLevel(i.member);
            if (cooldowns.remainingClaims <= 0 && cooldowns.nextClaimReset > 0 && permissionLevel < 2) {
                i.reply({
                    content: `${i.user} You can't claim a card yet! \nReset in ${cooldowns.nextClaimResetFormatted}`,  
                    ephemeral: false
                });
                return;
            }

            if (claimUser) {
                //Update card with the user id
                cards[cardId].userId = claimUser.id;
                await UserUtils.actionHandler(claimUser, "claim");
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
                let newComponents = ReplyUtils.recreateComponents(i.message.components);
                newComponents[0].components[cardId].setLabel("Claimed");
                newComponents[0].components[cardId].setStyle(ButtonStyle.Success);
                newComponents[0].components[cardId].setDisabled(true);
                //let deckImage = await Rendering.renderCardStack(cards);
                message.edit({ components: newComponents });
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

            
            let deckImage = await Rendering.renderCardStack(cards).catch(async err => {
                await interaction.channel.send(`Uooh an error! ${err.response?.status} ${err.response?.statusText} \n ${err.response?.data.message} \n ${err.response?.data.jobId}`);
            });
            if (!deckImage){ return; }
            message.edit({ components: [], files: [new AttachmentBuilder(deckImage)] });
        });
        
    }
}