const knex = require('../db/knex');

exports.getMyTeams = async (req, res) => {
  const { userId, role } = req.session;
  if (!userId || !role) return res.status(401).send({ message: 'Unauthorized' });

  let teamRows = [];
  if (role === 'player') {
    teamRows = await knex('teams')
      .join('player_team_requests', 'teams.id', 'player_team_requests.team_id')
      .where('player_team_requests.user_id', userId)
      .andWhere('player_team_requests.status', 'approved')
      .select('teams.*');
  } else if (role === 'coach') {
    teamRows = await knex('teams')
      .join('coach_team_requests', 'teams.id', 'coach_team_requests.team_id')
      .where('coach_team_requests.user_id', userId)
      .andWhere('coach_team_requests.status', 'approved')
      .select('teams.*');
  }

  res.send(teamRows);
};

/**
 * GET /api/teams/:id/players
 * Returns all approved players on the specified team (by team_id)
 */
exports.getPlayersForTeam = async (req, res) => {
  const teamId = parseInt(req.params.id);

  // Validate teamId param
  if (!teamId || isNaN(teamId)) {
    return res.status(400).send({ message: 'Invalid team ID' });
  }

  try {
    // Query: Join player_team_requests + users to get player data for approved requests
    const players = await knex('player_team_requests as ptr')
      .join('users', 'ptr.user_id', 'users.id')
      .select('users.id', 'users.name', 'users.nationality', 'users.age', 'users.role')
      .where('ptr.team_id', teamId)
      .andWhere('ptr.status', 'approved');

    res.send(players); // Return list to client
  } catch (err) {
    console.error('Failed to fetch team players:', err);
    res.status(500).send({ message: 'Server error while fetching team players.' });
  }
};