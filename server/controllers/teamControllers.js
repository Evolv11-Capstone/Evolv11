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