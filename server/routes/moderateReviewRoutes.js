// routes/moderateReviewRoutes.js
const express = require('express');
const router = express.Router();
const {
  submitPlayerMatchStats,
  getPlayerGrowthHistory,
  getPlayerMatchStats,
  getMatchReviews,
  testAISuggestions,
  updatePlayerReflection
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

// Test AI suggestions service
// GET /api/reviews/test-ai
router.get('/test-ai', testAISuggestions);

// Update player's reflection for a match
// PATCH /api/reviews/player/:playerId/match/:matchId/reflection
router.patch('/player/:playerId/match/:matchId/reflection', updatePlayerReflection);

module.exports = router;
