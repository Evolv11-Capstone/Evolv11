// server/controllers/matchControllers.js
const Match = require('../models/Match');

const createMatch = async (req, res) => {
  try {
    const { team_id, opponent, team_score, opponent_score, match_date } = req.body;

    if (!team_id || !opponent || match_date === undefined) {
      return res.status(400).json({ error: 'Missing required match data' });
    }

    // Map frontend fields to DB columns
    const [newMatch] = await Match.create({
      team_id,
      opponent,
      team_score,
      opponent_score,
      match_date,
    });

    res.status(201).json(newMatch);
  } catch (error) {
    console.error('Error creating match:', error);
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

    console.log('Fetched matches for team:', team_id, mappedMatches);

    res.json(mappedMatches);
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

module.exports = {
  createMatch,
  getMatchesForTeam,
  getMatchById, //  Export it
};


