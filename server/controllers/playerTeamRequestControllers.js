// Import the PlayerTeamRequest model
const PlayerTeamRequest = require('../models/PlayerTeamRequest');

// Controller: GET /api/player_team_requests
// Returns all player-team join requests in the database
exports.listPlayerRequests = async (req, res) => {
  try {
    // Fetch the list of requests from the model
    const requests = await PlayerTeamRequest.list();

    // Return them as a JSON array
    res.json(requests);
  } catch (err) {
    // Log any errors and return a 500 Internal Server Error
    console.error('Failed to list player requests:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller: POST /api/player_team_requests
// Submits a new join request for a player to a specific team
exports.createPlayerRequest = async (req, res) => {
  // Extract user_id and team_id from the request body
  const { user_id, team_id } = req.body;

  // Validate that both required fields are present
  if (!user_id || !team_id) {
    return res.status(400).json({ message: 'user_id and team_id are required.' });
  }

  try {
    // Attempt to create the request in the model
    const request = await PlayerTeamRequest.create(user_id, team_id);

    // Return the created request with 201 Created status
    res.status(201).json(request);
  } catch (err) {
    // If the error was due to a duplicate request, return a 409 Conflict
    if (err.message === 'Duplicate request') {
      return res.status(409).json({ message: 'Request already exists for this team.' });
    }

    // Otherwise, log the error and return a 500 Internal Server Error
    console.error('Failed to create player request:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller: PATCH /api/player_team_requests/:id/approve
// Approves a pending player-team request by ID
exports.approvePlayerRequest = async (req, res) => {
  // Extract the request ID from the route parameter
  const requestId = req.params.id;

  try {
    // Call the model method to approve the request
    const updatedRequest = await PlayerTeamRequest.approve(requestId);

    // Return the updated request
    res.json(updatedRequest);
  } catch (err) {
    // Log errors and return a 500 Internal Server Error
    console.error('Failed to approve player request:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.rejectRequest = async (req, res) => {
  const { id } = req.params;

  try {
    await knex('player_team_requests')
      .where({ id })
      .update({ status: 'rejected' });

    res.send({ success: true, message: 'Player request rejected' });
  } catch (err) {
    console.error('Failed to reject player request:', err);
    res.status(500).send({ success: false, message: 'Server error' });
  }
};
 