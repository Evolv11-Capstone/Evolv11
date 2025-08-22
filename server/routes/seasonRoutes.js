const express = require('express');
const router = express.Router();
const {
  getTeamSeasons,
  createSeason,
  getSeasonById,
  updateSeasonStatus,
  deleteSeason
} = require('../controllers/seasonControllers');

/**
 * @route GET /api/seasons/team/:teamId
 * @desc Get all seasons for a specific team
 * @access Private (requires authentication)
 */
router.get('/team/:teamId', getTeamSeasons);

/**
 * @route POST /api/seasons
 * @desc Create a new season
 * @access Private (requires authentication)
 */
router.post('/', createSeason);

/**
 * @route GET /api/seasons/:id
 * @desc Get season by ID
 * @access Private (requires authentication)
 */
router.get('/:id', getSeasonById);

/**
 * @route PATCH /api/seasons/:id/status
 * @desc Update season active status
 * @access Private (requires authentication)
 */
router.patch('/:id/status', updateSeasonStatus);

/**
 * @route DELETE /api/seasons/:id
 * @desc Delete a season
 * @access Private (requires authentication)
 */
router.delete('/:id', deleteSeason);

module.exports = router;
