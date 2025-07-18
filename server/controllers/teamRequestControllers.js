// Import the TeamRequest model
const TeamRequest = require('../models/PlayerTeamRequest');

/**
 * GET /api/team_requests
 * Returns all join requests
 */
exports.listRequests = async (req, res) => {
  const requests = await TeamRequest.list(); // Fetch all requests from DB
  res.send(requests); // Respond with the list
};

/**
 * POST /api/team_requests
 * Create a new join request
 */
exports.createRequest = async (req, res) => {
  const { user_id, team_id, role } = req.body; // Extract data from request body

  // Basic validation
  if (!user_id || !team_id || !role) {
    return res.status(400).send({ message: 'user_id, team_id, and role are required' });
  }

  try {
    const request = await TeamRequest.create(user_id, team_id, role); // Create a new request
    res.status(201).send(request); // Respond with the new request
  } catch (error) {
    console.error('Failed to create team request:', error);
    res.status(500).send({ message: 'Server error while creating request' });
  }
};

// Reject a player join request
exports.rejectRequest = async (req, res) => {
  const { id } = req.params;

  try {
    await knex('player_team_requests') // Use knex to update the request status
      .where({ id })
      .update({ status: 'rejected' });

    res.send({ success: true, message: 'Player request rejected' });
  } catch (err) {
    console.error('Failed to reject player request:', err);
    res.status(500).send({ success: false, message: 'Server error' });
  }
};

// Reject a coach join request
exports.rejectRequest = async (req, res) => {
  const { id } = req.params;

  try {
    await knex('coach_team_requests') // Use knex to update the request status
      .where({ id })
      .update({ status: 'rejected' });

    res.send({ success: true, message: 'Coach request rejected' });
  } catch (err) {
    console.error('Failed to reject coach request:', err);
    res.status(500).send({ success: false, message: 'Server error' });
  }
};

