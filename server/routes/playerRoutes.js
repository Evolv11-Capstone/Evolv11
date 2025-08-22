const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuthentication');
const playerControllers = require('../controllers/playerControllers');

// New image upload endpoint (used before user is created)
router.post('/upload-image', playerControllers.uploadImageOnly);

// Player profile route
router.get('/full-fifa-card/:playerId', playerControllers.getFullFifaCardById);

// Change :playerId to match controller and frontend
router.get('/:playerId', playerControllers.getPlayerById);

// GET /api/players/:playerId/moderate-summary
router.get('/:playerId/moderate-summary', playerControllers.getModerateStatsSummary);

// Update player position (coach only)
router.patch('/:id/position', playerControllers.updatePlayerPosition);

module.exports = router;