// Import the CoachTeamRequest model
const CoachTeamRequest = require('../models/CoachTeamRequest');

// Controller: GET /api/coach_team_requests
// Returns all coach join requests in the system
exports.listCoachRequests = async (req, res) => {
  try {
    // Fetch all coach-team requests from the model
    const requests = await CoachTeamRequest.list();

    // Respond with the array of request objects
    res.json(requests);
  } catch (err) {
    // Log any server error and return HTTP 500
    console.error('Failed to list coach requests:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller: POST /api/coach_team_requests
// Handles submission of a new coach join request
exports.createCoachRequest = async (req, res) => {
  // Extract user ID and team ID from the request body
  const { user_id, team_id } = req.body;

  // Return 400 if required fields are missing
  if (!user_id || !team_id) {
    return res.status(400).json({ message: 'user_id and team_id are required.' });
  }

  try {
    // Attempt to create the request
    const request = await CoachTeamRequest.create(user_id, team_id);

    // Respond with the created request object and HTTP 201
    res.status(201).json(request);
  } catch (err) {
    // If duplicate request, return 409 Conflict
    if (err.message === 'Duplicate request') {
      return res.status(409).json({ message: 'Request already exists for this team.' });
    }

    // Otherwise, return general server error
    console.error('Failed to create coach request:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller: PATCH /api/coach_team_requests/:id/approve
// Approves a specific coach join request by ID
exports.approveCoachRequest = async (req, res) => {
  const requestId = req.params.id; // Extract the request ID from route

  try {
    // Call model method to approve the request
    const updatedRequest = await CoachTeamRequest.approve(requestId);

    // Return the updated request object
    res.json(updatedRequest);
  } catch (err) {
    // Log error and respond with HTTP 500
    console.error('Failed to approve coach request:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller: PATCH /api/coach_team_requests/:id/reject
// Rejects a specific coach join request by ID
exports.rejectRequest = async (req, res) => {
  const { id } = req.params;

  try {
    await knex('coach_team_requests')
      .where({ id })
      .del(); // Delete the request instead of updating status

    res.send({ success: true, message: 'Coach request rejected and removed' });
  } catch (err) {
    console.error('Failed to reject coach request:', err);
    res.status(500).send({ success: false, message: 'Server error' });
  }
};
