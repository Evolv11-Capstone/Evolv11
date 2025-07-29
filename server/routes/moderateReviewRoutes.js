// routes/moderateReviewRoutes.js
const express = require('express');
const router = express.Router();
const {
  submitPlayerMatchStats,
  getPlayerGrowthHistory,
  getPlayerMatchStats
} = require('../controllers/ModerateReviewControllers');

// Submit or update player match stats
// POST /api/reviews/moderate
router.post('/moderate', submitPlayerMatchStats);

// Get player's growth history across all matches
// GET /api/reviews/player/:playerId/growth
router.get('/player/:playerId/growth', getPlayerGrowthHistory);

// Get specific match stats for a player
// GET /api/reviews/player/:playerId/match/:matchId
router.get('/player/:playerId/match/:matchId', getPlayerMatchStats);

module.exports = router;
