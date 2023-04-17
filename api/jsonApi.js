require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const { Card, User, DropHistory, Character, Group } = require("../models");
const { Op } = require('sequelize');

const ACCESS_TOKEN = process.env.API_ACCESS_TOKEN;
const app = express();
const router = express.Router();

const PREFIX = '/api/v1';

app.use(bodyParser.json());

function isAuthorized(req, res=null) {
  const providedToken = req.headers['apikey'];
  if (providedToken !== ACCESS_TOKEN) {
    if(res) {
    res.status(401).json({ error: 'Unauthorized' });
    }
    return false;
  }

  return true;
}

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
}).needsAuth= true;

app.use(PREFIX, router);
module.exports = app;
