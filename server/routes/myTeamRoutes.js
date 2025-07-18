const express = require('express');
const router = express.Router();
const controller = require('../controllers/myTeamsController');

router.get('/', controller.getMyTeams);
// GET /teams/:id/players → returns all approved players on a team
router.get('/teams/:id/players', controller.getPlayersForTeam);
module.exports = router;