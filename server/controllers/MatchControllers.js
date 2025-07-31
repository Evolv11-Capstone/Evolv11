// server/controllers/matchControllers.js
const Match = require('../models/Match');

const createMatch = async (req, res) => {
  try {
    const { team_id, season_id, opponent, team_score, opponent_score, match_date } = req.body;

    // Validate required fields
    if (!team_id || !season_id || !opponent || match_date === undefined) {
      return res.status(400).json({ 
        error: 'Missing required match data: team_id, season_id, opponent, and match_date are required' 
      });
    }

    // Validate season_id is a number
    if (isNaN(parseInt(season_id))) {
      return res.status(400).json({ 
        error: 'season_id must be a valid number' 
      });
    }

    // Create match with season validation
    const [newMatch] = await Match.create({
      team_id: parseInt(team_id),
      season_id: parseInt(season_id),
      opponent,
      team_score,
      opponent_score,
      match_date,
    });

    res.status(201).json({
      success: true,
      data: newMatch,
      message: 'Match created successfully'
    });

  } catch (error) {
    console.error('Error creating match:', error);
    
    // Handle specific validation errors
    if (error.message.includes('Season not found') || 
        error.message.includes('season bounds') || 
        error.message.includes('does not belong to')) {
      return res.status(400).json({ 
        error: error.message 
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create match'
    });
  }
};

// Legacy create match function (without season validation)
const createMatchLegacy = async (req, res) => {
  try {
    const { team_id, opponent, team_score, opponent_score, match_date } = req.body;

    if (!team_id || !opponent || match_date === undefined) {
      return res.status(400).json({ error: 'Missing required match data' });
    }

    // Use legacy create method
    const [newMatch] = await Match.createLegacy({
      team_id,
      opponent,
      team_score,
      opponent_score,
      match_date,
    });

    res.status(201).json(newMatch);
  } catch (error) {
    console.error('Error creating match (legacy):', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMatchesForTeam = async (req, res) => {
  try {
    const { team_id } = req.query;

    if (!team_id) {
      return res.status(400).json({ error: 'Missing team_id in query' });
    }

    const matches = await Match.findByTeam(team_id);

    // Map DB fields to frontend fields
    const mappedMatches = matches.map(match => ({
      ...match,
      goals_for: match.team_score,
      goals_against: match.opponent_score,
    }));
    
    // Always return matches array, even if empty (don't return 404 for empty results)
    res.json({
      success: true,
      data: mappedMatches,
      count: mappedMatches.length
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/matches/:id
const getMatchById = async (req, res) => {
  try {
    const matchId = parseInt(req.params.id);

    if (isNaN(matchId)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }


    res.json(match);
  } catch (err) {
    console.error('Error fetching match by ID:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/matches/:id - Update match details
const updateMatch = async (req, res) => {
  try {
    const matchId = parseInt(req.params.id);
    const { opponent, team_score, opponent_score, match_date } = req.body;

    if (isNaN(matchId)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }

    if (!opponent || match_date === undefined) {
      return res.status(400).json({ error: 'Missing required match data' });
    }

    const updatedMatch = await Match.update(matchId, {
      opponent,
      team_score,
      opponent_score,
      match_date,
    });

    if (!updatedMatch) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json(updatedMatch);
  } catch (err) {
    console.error('Error updating match:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/matches/:id - Delete match and all related data
const deleteMatch = async (req, res) => {
  try {
    const matchId = parseInt(req.params.id);

    if (isNaN(matchId)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }

    const deleted = await Match.delete(matchId);

    if (!deleted) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json({ message: 'Match and all related data deleted successfully' });
  } catch (err) {
    console.error('Error deleting match:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createMatch,
  createMatchLegacy,
  getMatchesForTeam,
  getMatchById, //  Export it
  updateMatch,
  deleteMatch,
};


