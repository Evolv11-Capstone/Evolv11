// routes/moderateReviewRoutes.js
const express = require('express');
const router = express.Router();
const {
  submitPlayerMatchStats,
  getPlayerGrowthHistory,
  getPlayerMatchStats,
  getMatchReviews
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

// Get all player reviews for a specific match
// GET /api/reviews/match/:matchId
router.get('/match/:matchId', getMatchReviews);

module.exports = router;
