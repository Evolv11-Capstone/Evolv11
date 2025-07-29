const express = require('express');
const router = express.Router();
const controller = require('../controllers/teamControllers');
const checkAuth = require('../middleware/checkAuthentication'); // ✅ if needed

router.get('/', controller.listTeams);
router.post('/', controller.createTeam);

// Get a specific team by ID
router.get('/:id', checkAuth, controller.getTeamById);

// ✅ New route to fetch players for a specific team
router.get('/:id/players', checkAuth, controller.getPlayersByTeam);

module.exports = router;
