// server/routes/matchRoutes.js
const express = require('express');
const router = express.Router();
const { createMatch, getMatchesForTeam, getMatchById } = require('../controllers/MatchControllers');
const checkAuthentication = require('../middleware/checkAuthentication');

router.post('/', checkAuthentication, createMatch);
router.get('/', checkAuthentication, getMatchesForTeam);
router.get('/:id', checkAuthentication, getMatchById); // 

module.exports = router;
