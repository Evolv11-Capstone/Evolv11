// routes/lineupRoutes.js
const express = require('express');
const router = express.Router();
const checkAuthentication = require('../middleware/checkAuthentication');

const {
  createLineup,             // POST: create new lineup for match/team
  updateFormation,          // PATCH: update formation and reset players
  addPlayerToLineup,        // POST: assign player to a specific position
  getFullLineupByMatch ,
  unassignPlayerFromLineup     // GET: fetch lineup + player assignments
} = require('../controllers/lineupControllers');

// ✅ POST /api/lineups
// Create a new lineup for a team and match
router.post('/', checkAuthentication, createLineup);

// ✅ PATCH /api/lineups/:id/formation
// Update the formation for a lineup and reset all player assignments
router.patch('/:id/formation', checkAuthentication, updateFormation);

// ✅ POST /api/lineups/players
// Assign a player to a specific position in the lineup
router.post('/players', checkAuthentication, addPlayerToLineup);

// DELETE /api/lineups/players — Unassign a player from lineup
router.delete('/players', checkAuthentication, unassignPlayerFromLineup);

// ✅ GET /api/lineups/:matchId/full
// Get the full lineup and all player assignments for a match
router.get('/:matchId/full', checkAuthentication, getFullLineupByMatch);

module.exports = router;