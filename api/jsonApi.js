require("dotenv").config();
const Sequelize = require('sequelize');
const express = require('express');
const bodyParser = require('body-parser');
const { Card, User, DropHistory, Character, Group } = require("../models");
const { isAuthorized } = require('./middleware/apiKeyAuth');
const { Op } = require('sequelize');

const groupRoutes = require('./routes/groups');

const ACCESS_TOKEN = process.env.API_ACCESS_TOKEN;
const app = express();
const router = express.Router();

const PREFIX = '/api/v1';

app.use(bodyParser.json());

router.get('/', (req, res) => {
  const routes = router.stack
    .filter(layer => layer.route) // Filter out non-routes
    .map(layer => {
      return {
        route: PREFIX + layer.route.path,
        methods: layer.route.methods
      };
    });

  res.json({ routes: routes });
});

router.get('/ping', (req, res) => {
  res.json({ status: 'Pong' });
});

router.get('/stats', async (req, res) => {
  
  if(!isAuthorized(req, res)){return;}

  res.json({ 
    users: await User.count(),
    cards: await Card.count({where: { burned: { [Op.eq]: false }}}),
    burned: await Card.count({where: { burned: { [Op.eq]: true }}}),
    drops: await DropHistory.count(),
    groups: await Group.count({where: { enabled: { [Op.eq]: true }}}),
    characters: await Character.count({where: { enabled: { [Op.eq]: true }}}),
    uptime: app.client.uptime
  });
});

router.get('/most-recent-drop', async (req, res) => {
  
  if(!isAuthorized(req, res)){return;}

  try {
    const mostRecentDrop = await DropHistory.findOne({
      order: [['createdAt', 'DESC']],
      where: {
        type: 0
      }
    });

    if (!mostRecentDrop) {
      return res.status(404).send('No drops found');
    }

   const dropData = JSON.parse(mostRecentDrop.dropData);

   const cards = await Promise.all(Object.keys(dropData).map(async key => {
     const cardData = dropData[key]?.cardData;
     if(!cardData) {return};
     const card = JSON.parse(cardData);
     return { identifier: card.identifier, quality: card.quality, character: await Character.findByPk(card.characterId) };
   }));
   
   let response = { dropper: await User.findByPk(dropData.dropper), cards: cards.filter(Boolean)};
  
   res.json(response);
 } catch (error) {
   console.error(error);
   res.status(500).send('Error fetching most recent drop');
 }
});

/**
 * Characters
 */
router.get('/characters', async (req, res) => {
  let condition = {
    where: {
        [Sequelize.Op.or]: [
            {enabled: 1}
        ]
    }
  }

  if(isAuthorized && req.query.include_disabled) {
    condition['where'][Sequelize.Op.or].push({enabled: 0});
  }

  let characters = await Character.findAll(condition);
  res.json(characters);
});

router.get('/characters/:character_id', async (req, res) => {
  let character = await Character.findByPk(req.params.character_id);
  
  if (!character.enabled && !isAuthorized(req)) {
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
  if(!isAuthorized(req, res)){return;}

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

app.use(PREFIX, router);
app.use(PREFIX, groupRoutes);
module.exports = app;
