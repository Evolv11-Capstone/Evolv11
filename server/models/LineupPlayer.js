// models/LineupPlayer.js — model for managing lineup player assignments
const db = require('../db/knex');

class LineupPlayer {
  // 🔁 Upsert a player to a lineup at a given position
  static async assign({ lineup_id, player_id, position }) {
    // 1. Remove any existing player assigned to this position in the same lineup
    await db('lineup_players')
      .where({ lineup_id, position })
      .del();

    // 2. Remove any other position assignment this player may already have in the same lineup
    await db('lineup_players')
      .where({ lineup_id, player_id })
      .del();

    // 3. Insert the new player assignment for the given position
    const [result] = await db('lineup_players')
      .insert({ lineup_id, player_id, position })
      .returning('*');

    return result;
  }

  // ❌ Unassign a player from a lineup
  // This will remove the player from the lineup entirely
  static async unassign({ lineup_id, player_id }) {
  return await db('lineup_players')
    .where({ lineup_id, player_id })
    .del();
}

  // 🔍 Get all assignments for a given lineup
  static async findByLineup(lineup_id) {
    return await db('lineup_players').where({ lineup_id });
  }

  // ❌ Remove a player from a specific position in a lineup
  static async remove({ lineup_id, position }) {
    return await db('lineup_players')
      .where({ lineup_id, position })
      .del();
  }

  // 🔄 Update a player's position (if needed — not used if using assign() exclusively)
  static async updatePosition({ lineup_id, player_id, newPosition }) {
    // Update the record where player is already assigned
    const [updated] = await db('lineup_players')
      .where({ lineup_id, player_id })
      .update({ position: newPosition })
      .returning('*');
    return updated;
  }

  static async findFullByLineup(lineup_id) {
  try {
    const results = await db('lineup_players')
      .where({ lineup_id })
      .join('players', 'lineup_players.player_id', 'players.id')
      .join('users', 'players.user_id', 'users.id')
      .select(
        'lineup_players.id as assignment_id',
        'lineup_players.position',
        'players.id as player_id',
        'players.team_id',
        'players.overall_rating',
        'players.shooting',
        'players.passing',
        'players.dribbling',
        'players.defense',
        'players.physical',
        'users.name',
        'users.nationality'
      );

    console.log('✅ Fetched player assignments:', results.length, 'players');
    return results || [];
  } catch (err) {
    console.error('❌ DB error in findFullByLineup:', err);
    return [];
  }
}
}

module.exports = LineupPlayer;
