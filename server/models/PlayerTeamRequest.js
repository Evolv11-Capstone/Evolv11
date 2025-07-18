// Import the configured Knex database instance
const knex = require('../db/knex');

// Define a class to model the player_team_requests table
class PlayerTeamRequest {
  // Constructor maps the raw database row into an instance of the model
  constructor({ id, user_id, team_id, status, created_at, updated_at }) {
    this.id = id;                   // Unique ID of the request
    this.user_id = user_id;         // The player making the request
    this.team_id = team_id;         // The team the player wants to join
    this.status = status;           // Request status: 'pending', 'approved', or 'rejected'
    this.created_at = created_at;   // Timestamp of request creation
    this.updated_at = updated_at;   // Timestamp of last update to the request
  }

  // Fetch player requests with user info
static async list() {
  // Query the player_team_requests table and join with users to get user details
  // Select relevant fields including user name and role
  const results = await knex('player_team_requests as ptr')
    .join('users as u', 'ptr.user_id', 'u.id')
    .select(
      'ptr.id',
      'ptr.team_id',
      'ptr.user_id',
      'ptr.status',
      'u.name as user_name',
      'u.role as role'
    );

  return results;
}

  // Static method to create a new player-team join request
  static async create(user_id, team_id) {
    // First, check if the user has already submitted a request to this team
    const existing = await knex('player_team_requests')
      .where({ user_id, team_id })
      .first();

    // If a request already exists, we raise an error to prevent duplicates
    if (existing) {
      throw new Error('Duplicate request');
    }

    // Otherwise, insert the new request into the database with status 'pending'
    const [row] = await knex('player_team_requests')
      .insert({ user_id, team_id, status: 'pending' })
      .returning('*'); // Return the full inserted row

    // Return the result as a new PlayerTeamRequest instance
    return new PlayerTeamRequest(row);
  }

  // Static method to approve a request (sets status to 'approved')
  static async approve(id) {
    // Update the request with the given ID and set its status to 'approved'
    const [row] = await knex('player_team_requests')
      .where({ id })
      .update({ status: 'approved' })
      .returning('*');

    // Return the updated request instance
    return new PlayerTeamRequest(row);
  }
}

// Export the model so it can be used in controllers and services
module.exports = PlayerTeamRequest;
