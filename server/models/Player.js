const knex = require('../db/knex');

class Player {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;                     // From users table
    this.role = data.role;                     // From users table
    this.nationality = data.nationality;       // From users table

    this.position = data.position;             // From players table
    this.overall_rating = data.overall_rating;
    this.shooting = data.shooting;
    this.passing = data.passing;
    this.defense = data.defense;
    this.stamina = data.stamina;
    this.dribbling = data.dribbling;

    this.team_id = data.team_id;               // From players table
    this.image_url = data.image_url;           // From users table
    this.created_at = data.created_at;
  }

  // Fetch full player profile by player ID, including joined user info
  static async findById(id) {
    const player = await knex('players')
      .join('users', 'players.user_id', 'users.id') // Join to pull user details
      .select(
        'players.*',
        'users.name',
        'users.role',
        'users.nationality',
        'users.image_url' // This is now fetched from users table
      )
      .where('players.id', id)
      .first();

    return player ? new Player(player) : null;
  }

  // Optional future method for performance updates (does not include image logic anymore)
  static async updateStats(playerId, updates) {
    const result = await knex('players')
      .where({ id: playerId })
      .update(updates)
      .returning('*');

    return result.length ? new Player(result[0]) : null;
  }
}

module.exports = Player;
