const express = require('express');
const { Badge } = require('../../models');
const { isAuthorized } = require('../middleware/apiKeyAuth');


const router = express.Router();

/**
 * Badges
 */
router.get('/badges', async (req, res) => {
    let badges = await Badge.findAll();
    res.json(badges);
});

router.get('/badges/:badge_id', async (req, res) => {
    let badge = await Badge.findByPk(req.params.badge_id);

    if (!badge) {
        res.status(404).json({ error: 'Badge not found' });
        return;
    }
    res.json(badge);
});

router.post('/badges', async (req, res) => {
    try {
        const newBadgeData = req.body;

        const newBadge = await Badge.create(newBadgeData);

        res.status(201).json({ message: 'Badge created successfully.', Badge: newBadge });
    } catch (error) {
        res.status(500).json({ message: 'Error creating Badge.', error });
    }
});

router.put('/badges/:badge_id', async (req, res) => {
    if (!isAuthorized(req, res)) { return; }

    try {
        const badgeId = req.params.badge_id;
        const updatedBadgeData = req.body;

        const [updatedRowCount] = await Badge.update(updatedBadgeData, {
            where: { id: badgeId }
        });

        if (updatedRowCount === 0) {
            return res.status(404).json({ message: 'Badge not found.' });
        }

        res.status(200).json({ message: 'Badge updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating Badge.', error });
    }
});

module.exports = router;