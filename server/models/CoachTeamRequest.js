// Import the Knex database instance
const knex = require('../db/knex');

// Define a model class for the coach_team_requests table
class CoachTeamRequest {
  // Constructor maps raw DB row into a model instance
  constructor({ id, user_id, team_id, status, created_at, updated_at }) {
    this.id = id;                   // Unique ID of the request
    this.user_id = user_id;         // ID of the coach submitting the request
    this.team_id = team_id;         // ID of the team the coach wants to join
    this.status = status;           // Request status: 'pending' or 'approved' (rejected requests are deleted)
    this.created_at = created_at;   // Timestamp of creation
    this.updated_at = updated_at;   // Timestamp of last update
  }

// Fetch coach requests with user info
static async list() {
  // Query the coach_team_requests table and join with users to get user details
  // Select relevant fields including user name, role, and image
  const results = await knex('coach_team_requests as ctr')
    .join('users as u', 'ctr.user_id', 'u.id')
    .select(
      'ctr.id',
      'ctr.team_id',
      'ctr.user_id',
      'ctr.status',
      'u.name as user_name',
      'u.role as role',
      'u.image_url as user_image'
    );

  return results;
}


  // Create a new coach-team request with an optional status argument
static async create(user_id, team_id, status = 'pending') {
  // Check if this request already exists
  const existing = await knex('coach_team_requests')
    .where({ user_id, team_id })
    .first();

  if (existing) {
    throw new Error('Duplicate request');
  }

  // Insert the request with the given status (default is 'pending')
  const [row] = await knex('coach_team_requests')
    .insert({ user_id, team_id, status })
    .returning('*');

  return new CoachTeamRequest(row);
}

  // Approve an existing request by ID
  static async approve(id) {
    const [row] = await knex('coach_team_requests')
      .where({ id })
      .update({ status: 'approved' })
      .returning('*');

    return new CoachTeamRequest(row);
  }
}

// Export the model for use in route controllers
module.exports = CoachTeamRequest;
