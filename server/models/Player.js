const knex = require('../db/knex');

class Player {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.role = data.role;
    this.nationality = data.nationality;
    this.position = data.position;
    this.overall_rating = data.overall_rating;

    // Attributes like shooting, passing, defense, etc.
    this.shooting = data.shooting;
    this.passing = data.passing;
    this.defense = data.defense;
    this.stamina = data.stamina;
    this.dribbling = data.dribbling;

    this.team_id = data.team_id;
    this.image_url = data.image_url;
    this.created_at = data.created_at;
  }

  // Fetch full player profile by ID
  static async findById(id) {
    const player = await knex('players').where({ id }).first();
    return player ? new Player(player) : null;
  }
}

module.exports = Player;
