const knex = require('../db/knex');

class Team {
  constructor({ id, name, coach_id }) {
    this.id = id;
    this.name = name;
    this.coach_id = coach_id;
  }

  // Fetch all teams
  static async list() {
    const teams = await knex('teams').select('*');
    return teams.map((t) => new Team(t));
  }

  // Create a new team
  static async create(name) {
    const [team] = await knex('teams')
      .insert({ name })
      .returning('*');
    return new Team(team);
  }

  // Find a team by ID
  static async findById(teamId) {
    const team = await knex('teams')
      .where('id', teamId)
      .first();
    return team ? new Team(team) : null;
  }

  // ✅ NEW: Get all approved players on this team
  static async getPlayers(teamId) {
  const results = await knex('players')
    .join('users', 'players.user_id', 'users.id')
    .where('players.team_id', teamId)
    .select(
      'players.id as id',           // ✅ required for navigation
      'players.user_id',            // ✅ missing right now
      'players.team_id',
      'players.position',
      'players.overall_rating',
      'players.shooting',
      'players.passing',
      'players.dribbling',
      'players.defense',
      'players.physical',
      'players.created_at',
      'users.name',
      'users.role',
      'users.nationality',
      'users.image_url'
    );

  return results;
}

}

module.exports = Team;
