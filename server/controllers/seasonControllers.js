const Season = require('../models/Season');
const db = require('../db/knex');

/**
 * Get all seasons for a specific team
 * GET /api/seasons/team/:teamId
 */
const getTeamSeasons = async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!teamId || isNaN(parseInt(teamId))) {
      return res.status(400).json({ 
        error: 'Invalid or missing team ID' 
      });
    }

    const seasons = await Season.getTeamSeasons(parseInt(teamId));

    // Always return seasons array, even if empty (consistent with matches controller)
    res.status(200).json({
      success: true,
      data: seasons,
      count: seasons.length
    });

  } catch (error) {
    console.error('Error fetching team seasons:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch team seasons'
    });
  }
};

/**
 * Create a new season
 * POST /api/seasons
 */
const createSeason = async (req, res) => {
  try {
    const { team_id, name, start_date, end_date } = req.body;

    // Validation
    if (!team_id || !name || !start_date || !end_date) {
      return res.status(400).json({ 
        error: 'Missing required fields: team_id, name, start_date, end_date' 
      });
    }

    // Validate date format (basic check)
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD format' 
      });
    }

    const newSeason = await Season.create({
      team_id: parseInt(team_id),
      name: name.trim(),
      start_date,
      end_date
    });

    res.status(201).json({
      success: true,
      data: newSeason,
      message: 'Season created successfully'
    });

  } catch (error) {
    console.error('Error creating season:', error);
    
    // Handle specific business logic errors
    if (error.message.includes('overlap') || error.message.includes('start date must be before')) {
      return res.status(400).json({ 
        error: error.message 
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create season'
    });
  }
};

/**
 * Get season by ID
 * GET /api/seasons/:id
 */
const getSeasonById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'Invalid season ID' 
      });
    }

    const season = await Season.findById(parseInt(id));

    if (!season) {
      return res.status(404).json({ 
        error: 'Season not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: season
    });

  } catch (error) {
    console.error('Error fetching season:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch season'
    });
  }
};

/**
 * Update season active status
 * PATCH /api/seasons/:id/status
 */
const updateSeasonStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'Invalid season ID' 
      });
    }

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ 
        error: 'is_active must be a boolean value' 
      });
    }

    const updatedSeason = await Season.updateActiveStatus(parseInt(id), is_active);

    if (!updatedSeason) {
      return res.status(404).json({ 
        error: 'Season not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: updatedSeason,
      message: 'Season status updated successfully'
    });

  } catch (error) {
    console.error('Error updating season status:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update season status'
    });
  }
};

/**
 * Delete a season and all associated data
 * DELETE /api/seasons/:id
 */
const deleteSeason = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'Invalid season ID' 
      });
    }

    const seasonId = parseInt(id);
    
    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ 
        error: 'Season not found' 
      });
    }

    // Get match count for user feedback
    const matchCount = await db('matches').where({ season_id: seasonId }).count('id as count');
    const totalMatches = matchCount[0].count;

    // Attempt to delete with cascading
    const deleted = await Season.delete(seasonId);

    if (!deleted) {
      return res.status(404).json({ 
        error: 'Season not found or could not be deleted' 
      });
    }

    res.status(200).json({
      success: true,
      message: `Season "${season.name}" and all associated data deleted successfully`,
      deletedData: {
        season: season.name,
        matchesDeleted: totalMatches,
        note: 'All lineups, player assignments, and statistics for this season have been removed'
      }
    });

  } catch (error) {
    console.error('Error deleting season:', error);
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete season and associated data'
    });
  }
};

module.exports = {
  getTeamSeasons,
  createSeason,
  getSeasonById,
  updateSeasonStatus,
  deleteSeason
};
