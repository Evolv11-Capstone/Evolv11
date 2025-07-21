const express = require('express');
const router = express.Router();
const controller = require('../controllers/teamControllers');
const checkAuth = require('../middleware/checkAuthentication'); // ✅ if needed

router.get('/', controller.listTeams);
router.post('/', controller.createTeam);

// ✅ New route to fetch players for a specific team
router.get('/:id/players', checkAuth, controller.getPlayersByTeam);

module.exports = router;
