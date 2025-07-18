const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// GET /api/players/:id - fetch full details of a single player
router.get('/:id', playerController.getPlayerById);

module.exports = router;
