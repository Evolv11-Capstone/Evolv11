const express = require('express');
const router = express.Router();
const playerControllers = require('../controllers/playerControllers');

// New image upload endpoint (used before user is created)
router.post('/upload-image', playerControllers.uploadImageOnly);

// Player profile route
router.get('/:id', playerControllers.getPlayerById);

module.exports = router;