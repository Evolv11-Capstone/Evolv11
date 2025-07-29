// server/routes/matchRoutes.js
const express = require('express');
const router = express.Router();
const { createMatch, getMatchesForTeam, getMatchById, updateMatch, deleteMatch } = require('../controllers/MatchControllers');
const checkAuthentication = require('../middleware/checkAuthentication');

router.post('/', checkAuthentication, createMatch);
router.get('/', checkAuthentication, getMatchesForTeam);
router.get('/:id', checkAuthentication, getMatchById);
router.put('/:id', checkAuthentication, updateMatch);
router.delete('/:id', checkAuthentication, deleteMatch);

module.exports = router;
