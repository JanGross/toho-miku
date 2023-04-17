const express = require('express');
const Sequelize = require('sequelize');
const { Group } = require('../../models');
const { isAuthorized } = require('../middleware/apiKeyAuth');

const router = express.Router();

/**
 * Groups
 */
router.get('/groups', async (req, res) => {
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

    let groups = await Group.findAll(condition);
    res.json(groups);
});

router.get('/groups/:group_id', async (req, res) => {
    let group = await Group.findByPk(req.params.group_id);

    if (!group.enabled && !isAuthorized(req)) {
        res.status(404).json({ error: 'Group not found' });
        return;
    }
    res.json(group);
});

router.post('/groups', async (req, res) => {
    try {
        const newGroupData = req.body;

        const newGroup = await Group.create(newGroupData);

        res.status(201).json({ message: 'Group created successfully.', group: newGroup });
    } catch (error) {
        res.status(500).json({ message: 'Error creating group.', error });
    }
});

router.put('/groups/:group_id', async (req, res) => {
    if (!isAuthorized(req, res)) { return; }

    try {
        const groupId = req.params.group_id;
        const updatedGroupData = req.body;

        const [updatedRowCount] = await Group.update(updatedGroupData, {
            where: { id: groupId }
        });

        if (updatedRowCount === 0) {
            return res.status(404).json({ message: 'Group not found.' });
        }

        res.status(200).json({ message: 'Group updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating Group.', error });
    }
});

module.exports = router;