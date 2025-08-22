// controllers/lineupControllers.js — handles HTTP requests for lineups
const Lineup = require('../models/Lineup');
const LineupPlayer = require('../models/LineupPlayer');

// ✅ POST /api/lineups — Create or update (upsert) a single lineup per match
const createLineup = async (req, res) => {
  try {
    const { team_id, match_id, formation } = req.body;

    if (!team_id || !match_id || !formation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const lineup = await Lineup.upsert({ team_id, match_id, formation });

    res.status(200).json(lineup);
  } catch (err) {
    console.error('Error creating/updating lineup:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ✅ PATCH /api/lineups/:id/formation — Update a lineup's formation & clear existing assignments
const updateFormation = async (req, res) => {
  try {
    const { id } = req.params;
    const { formation } = req.body;

    if (!formation) {
      return res.status(400).json({ error: 'Formation is required' });
    }

    // Update formation in DB
    const updatedLineup = await Lineup.updateFormation(id, formation);

    // Reset all player assignments for this lineup
    await LineupPlayer.clearAssignments(id);

    res.status(200).json(updatedLineup);
  } catch (error) {
    console.error('❌ Error updating formation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ✅ POST /api/lineups/players — Assign a player to a lineup position
const addPlayerToLineup = async (req, res) => {
  try {
    const { lineup_id, player_id, position } = req.body;

    if (!lineup_id || !player_id || !position) {
      return res.status(400).json({ error: 'Missing lineup_id, player_id, or position' });
    }

    // Insert player-position assignment (will not check for duplicates unless model enforces it)
    const result = await LineupPlayer.assign({
      lineup_id,
      player_id,
      position,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Error assigning player to lineup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/lineups/players — Unassign a player from a lineup position
const unassignPlayerFromLineup = async (req, res) => {
  try {
    const { lineup_id, player_id } = req.body;

    if (!lineup_id || !player_id) {
      return res.status(400).json({ error: 'Missing lineup_id or player_id' });
    }

    await LineupPlayer.unassign({ lineup_id, player_id });
    res.status(200).json({ message: 'Player unassigned successfully' });
  } catch (err) {
    console.error('❌ Error unassigning player:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/lineups/:matchId/full — retrieve full lineup with player info
const getFullLineupByMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    const lineup = await Lineup.findByMatch(matchId);
    console.log(`Lineup for match ${matchId}:`, lineup);
    if (!lineup) {
      return res.status(404).json({ error: 'Lineup not found for this match' });
    }

    const players = await LineupPlayer.findFullByLineup(lineup.id);
    console.log(`players for lineup ${lineup.id}:`, players);

    console.log('🎯 Returning full lineup with players:', {
  lineup_id: lineup.id,
  formation: lineup.formation,
  match_id: lineup.match_id,
  team_id: lineup.team_id,
  players,
});

    res.status(200).json({
      lineup_id: lineup.id,
      formation: lineup.formation,
      match_id: lineup.match_id,
      team_id: lineup.team_id,
      players, // ✅ this is what your frontend expects
    });
  } catch (error) {
    console.error('Error fetching full lineup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = {
  createLineup,
  updateFormation,
  addPlayerToLineup,
  getFullLineupByMatch,
  unassignPlayerFromLineup
};
