// Import the PlayerTeamRequest model
const PlayerTeamRequest = require('../models/PlayerTeamRequest');
const Player = require('../models/Player');              // Player model
const PlayerSnapshot = require('../models/PlayerSnapshot'); // PlayerSnapshot model
// Import the Player model for creating player cards
const knex = require('../db/knex');

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
  const requestId = parseInt(req.params.id, 10);

  if (isNaN(requestId)) {
    return res.status(400).json({ message: 'Invalid request ID' });
  }

  try {
    // 1. Find the player_team_request
    const request = await knex('player_team_requests')
      .where({ id: requestId })
      .first();

    if (!request) {
      return res.status(404).json({ message: 'Team request not found' });
    }

    if (request.status === 'approved') {
      return res.status(400).json({ message: 'Request already approved' });
    }

    // 2. Approve the request
    await knex('player_team_requests')
      .where({ id: requestId })
      .update({ status: 'approved' });

    // 3. Check if player card already exists
    const existingPlayer = await knex('players')
      .where({ user_id: request.user_id, team_id: request.team_id })
      .first();

    if (existingPlayer) {
      // Check if this player already has an initial snapshot
      try {
        const existingSnapshot = await PlayerSnapshot.getLatestSnapshot(existingPlayer.id);
        if (!existingSnapshot) {
          // Create initial snapshot for existing player who doesn't have one
          const initialSnapshot = await PlayerSnapshot.createInitialSnapshot(existingPlayer.id);
          console.log(`Initial snapshot created for existing player ${existingPlayer.id}:`, initialSnapshot);
          
          return res.json({
            message: 'Request approved — player card already exists, initial snapshot created',
            player: existingPlayer,
          });
        }
      } catch (snapshotError) {
        console.error('Failed to create/check snapshot for existing player:', snapshotError);
      }

      return res.json({
        message: 'Request approved — player card already exists',
        player: existingPlayer,
      });
    }

    // 4. Create new player card
    const [newPlayer] = await Player.create(request.user_id, request.team_id);

    // 5. Create initial player snapshot
    try {
      const initialSnapshot = await PlayerSnapshot.createInitialSnapshot(newPlayer.id);
      console.log(`Initial snapshot created for player ${newPlayer.id}:`, initialSnapshot);
    } catch (snapshotError) {
      console.error('Failed to create initial snapshot:', snapshotError);
      // Don't fail the entire request if snapshot creation fails
    }

    return res.json({
      message: 'Request approved, player card created, and initial snapshot recorded',
      player: newPlayer,
    });
  } catch (error) {
    console.error('Error approving player request:', error);
    res.status(500).json({ message: 'Failed to approve team request' });
  }
};


exports.rejectRequest = async (req, res) => {
  const { id } = req.params;

  try {
    await knex('player_team_requests')
      .where({ id })
      .del(); // Delete the request instead of updating status

    res.send({ success: true, message: 'Player request rejected and removed' });
  } catch (err) {
    console.error('Failed to reject player request:', err);
    res.status(500).send({ success: false, message: 'Server error' });
  }
};
 