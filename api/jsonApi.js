require("dotenv").config();
const Sequelize = require('sequelize');
const express = require('express');
const bodyParser = require('body-parser');
const { Card, User, DropHistory, Character, Group } = require("../models");
const { isAuthorized } = require('./middleware/apiKeyAuth');
const { Op } = require('sequelize');

const groupRoutes = require('./routes/groups');
const badgeRoutes = require('./routes/badges');
const characterRoutes = require('./routes/characters');

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

//Fallback route - Has to be defined last!
router.all('*', (req, res) => {
  res.redirect(process.env.HOMEPAGE_URL);
});

app.use(PREFIX, router);
app.use(PREFIX, groupRoutes);
app.use(PREFIX, badgeRoutes);
app.use(PREFIX, characterRoutes);
app.use('/assets', express.static('assets'));

module.exports = app;
