const express = require('express');
const router = express.Router();
const controller = require('../controllers/teamControllers');

router.get('/', controller.listTeams);
router.post('/', controller.createTeam);

module.exports = router;
