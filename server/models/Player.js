const knex = require('../db/knex');

class Player {
  constructor(data) {
  this.id = data.id;
  this.user_id = data.user_id;
  this.team_id = data.team_id;
  this.position = data.position;
  this.overall_rating = data.overall_rating;
  this.shooting = data.shooting;
  this.passing = data.passing;
  this.dribbling = data.dribbling;
  this.defense = data.defense;
  this.physical = data.physical;
  this.coach_grade = data.coach_grade; // ✅ Include this
  this.diving = data.diving; // ✅ Goalkeeper attribute
  this.handling = data.handling; // ✅ Goalkeeper attribute
  this.kicking = data.kicking; // ✅ Goalkeeper attribute
  this.created_at = data.created_at;

  // Joined from users table
  this.name = data.name;
  this.role = data.role;
  this.nationality = data.nationality;
  this.image_url = data.image_url;
}


  static async create(userId, teamId) {
    return await knex('players')
      .insert({
        user_id: userId,
        team_id: teamId,
        overall_rating: 50,
        shooting: 50,
        passing: 50,
        dribbling: 50,
        defense: 50,
        physical: 50,
      })
      .returning('*');
  }

  static async findById(playerId) {
    const result = await knex('players').where({ id: playerId }).first();
    return result ? new Player(result) : null;
  }

  static async findByIdWithFullStats(playerId) {
  const result = await knex('players')
    .join('users', 'players.user_id', 'users.id') // ✅ join
    .select(
      'players.id',
      'players.user_id',
      'players.team_id',
      'players.position',
      'players.overall_rating',
      'players.shooting',
      'players.passing',
      'players.dribbling',
      'players.defense',
      'players.physical',
      'players.coach_grade',
      'players.diving',
      'players.handling',
      'players.kicking',
      'players.created_at',
      'users.name',
      'users.role',
      'users.nationality',
      'users.image_url'
    )
    .where('players.id', parseInt(playerId))
    .first();

  return result ? new Player(result) : null;
}


  static async updateStats(playerId, updates) {
    const result = await knex('players')
      .where({ id: playerId })
      .update(updates)
      .returning('*');

    return result.length ? new Player(result[0]) : null;
  }

}

module.exports = Player;
