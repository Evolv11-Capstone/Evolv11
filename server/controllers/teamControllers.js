// Import the Team model
const Team = require('../models/Team');
const CoachTeamRequest = require('../models/CoachTeamRequest'); // import this at top

/**
 * GET /api/teams
 * Returns a list of all teams in the database
 */
exports.listTeams = async (req, res) => {
  const teams = await Team.list();
  res.send(teams);
};

/**
 * POST /api/teams
 * Creates a new team with the given name and coach_id
 */
exports.createTeam = async (req, res) => {
  const { name, coach_id } = req.body;

  if (!name || !coach_id) {
    return res.status(400).send({ message: 'Team name and coach_id required.' });
  }

  try {
    // Step 1: Create the team
    const team = await Team.create(name);

    // Step 2: Auto-approve a coach join request for the creator
    await CoachTeamRequest.create(coach_id, team.id, 'approved');

    res.send(team);
  } catch (err) {
    console.error('Failed to create team:', err);
    res.status(500).json({ message: 'Failed to create team.' });
  }
};

/**
 * GET /api/teams/:id/players
 * Returns a list of approved players on a specific team
 */
exports.getPlayersByTeam = async (req, res) => {
  const teamId = parseInt(req.params.id, 10);

  if (isNaN(teamId)) {
    return res.status(400).json({ message: 'Invalid team ID' });
  }

  try {
    const players = await Team.getPlayers(teamId);
    console.log('Returned players:', players.map(p => ({ id: p.id, user_id: p.user_id })));
    res.json(players);
  } catch (err) {
    console.error('Failed to fetch players for team:', err);
    res.status(500).json({ message: 'Failed to fetch team players' });
  }
};