const Sequelize = require('sequelize');
const { Card, Character, User } = require('../models');
const { QUALITY_NAMES } = require('../config/constants');

module.exports = {
    name: "SearchUtils",
    findByName: async function(model, search, lim=10) {
        let results = []
        let choices = [];
        const rows = await model.findAll({
            where: {
                name: {
                    [Sequelize.Op.like]: `%${search}%`
                }
            },
            limit: lim
        });
        for (let i = 0; i < rows.length; i++) {
            choices.push({
                name: rows[i].name,
                value: `${rows[i].id}`
            });
        }
        results["rows"] = rows;
        results["choices"] = choices;
        return results;
    },

    findCards: async function(focusedOption, options={}) {
        let choices = [];
        let condition = {
            where: {
                [Sequelize.Op.or]: [
                    {identifier: { [Sequelize.Op.like]: `%${focusedOption.value}%` }},
                    {'$Character.name$': { [Sequelize.Op.like]: `%${focusedOption.value}%` }}
                ],
                burned: false
            },
            include: [{ model: Character }, { model: User }],
            limit: 10
        }
        if (options.ownedOnly) {
            condition.where.userId = { [Sequelize.Op.eq]: options.user.id };
        }
        const cards = await Card.findAll(condition);
        for (let i = 0; i < cards.length; i++) {
            let owned = "";
            if (options.user) {
                owned = cards[i].userId === options.user.id ? " (owned)" : "";
            }
            choices.push({
                name: `${cards[i].identifier} - ${cards[i].Character.name} (${QUALITY_NAMES[cards[i].quality]})${owned}`,
                value: cards[i].identifier
            });
        }
        return { "rows": cards, "choices": choices };
    }
}
