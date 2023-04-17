const express = require('express');
const Sequelize = require('sequelize');
const { Character } = require('../../models');
const { isAuthorized } = require('../middleware/apiKeyAuth');

const router = express.Router();

/**
 * Characters
 */
router.get('/characters', async (req, res) => {
    let condition = {
        where: {
            [Sequelize.Op.or]: [
                { enabled: 1 }
            ]
        }
    }

    if (isAuthorized && req.query.include_disabled) {
        condition['where'][Sequelize.Op.or].push({ enabled: 0 });
    }

    let characters = await Character.findAll(condition);
    res.json(characters);
});

router.get('/characters/:character_id', async (req, res) => {
    let character = await Character.findByPk(req.params.character_id);

    if (!character || !character.enabled && !isAuthorized(req)) {
        res.status(404).json({ error: 'Character not found' });
        return;
    }
    res.json(character);
});

router.post('/characters', async (req, res) => {
    try {
        const newCharacterData = req.body;

        const newCharacter = await Character.create(newCharacterData);

        res.status(201).json({ message: 'Character created successfully.', character: newCharacter });
    } catch (error) {
        res.status(500).json({ message: 'Error creating character.', error });
    }
});

router.put('/characters/:character_id', async (req, res) => {
    if (!isAuthorized(req, res)) { return; }

    try {
        const characterId = req.params.character_id;
        const updatedCharacterData = req.body;

        const [updatedRowCount] = await Character.update(updatedCharacterData, {
            where: { id: characterId }
        });

        if (updatedRowCount === 0) {
            return res.status(404).json({ message: 'Character not found.' });
        }

        res.status(200).json({ message: 'Character updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating character.', error });
    }
});

module.exports = router;