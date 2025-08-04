const knex = require('../db/knex');

class PlayerSnapshot {
  constructor(data) {
    this.id = data.id;
    this.player_id = data.player_id;
    this.match_id = data.match_id;
    this.shooting = data.shooting;
    this.passing = data.passing;
    this.dribbling = data.dribbling;
    this.defense = data.defense;
    this.physical = data.physical;
    this.coach_grade = data.coach_grade;
    this.overall_rating = data.overall_rating;
    this.created_at = data.created_at;
  }

  /**
   * Create a new player snapshot
   * @param {number} playerId - The ID of the player
   * @param {number|null} matchId - The ID of the match (null for initial snapshot)
   * @param {Object} attributes - Player attributes at this point in time
   * @returns {Promise<PlayerSnapshot>}
   */
  static async create(playerId, matchId = null, attributes) {
    const snapshotData = {
      player_id: playerId,
      match_id: matchId,
      shooting: attributes.shooting,
      passing: attributes.passing,
      dribbling: attributes.dribbling,
      defense: attributes.defense,
      physical: attributes.physical,
      coach_grade: attributes.coach_grade || 50, // Default if not provided
      overall_rating: attributes.overall_rating,
    };

    const [result] = await knex('player_snapshots')
      .insert(snapshotData)
      .returning('*');

    return new PlayerSnapshot(result);
  }

  /**
   * Create an initial snapshot for a newly approved player
   * @param {number} playerId - The ID of the player
   * @returns {Promise<PlayerSnapshot>}
   */
  static async createInitialSnapshot(playerId) {
    // Get current player attributes
    const player = await knex('players')
      .where({ id: playerId })
      .first();

    if (!player) {
      throw new Error(`Player with ID ${playerId} not found`);
    }

    // Create snapshot with current attributes (match_id = null for initial)
    return await PlayerSnapshot.create(playerId, null, {
      shooting: player.shooting,
      passing: player.passing,
      dribbling: player.dribbling,
      defense: player.defense,
      physical: player.physical,
      coach_grade: player.coach_grade || 50,
      overall_rating: player.overall_rating,
    });
  }

  /**
   * Get all snapshots for a player
   * @param {number} playerId - The ID of the player
   * @returns {Promise<PlayerSnapshot[]>}
   */
  static async getPlayerSnapshots(playerId) {
    const results = await knex('player_snapshots')
      .where({ player_id: playerId })
      .orderBy('created_at', 'asc');

    return results.map(data => new PlayerSnapshot(data));
  }

  /**
   * Get the most recent snapshot for a player
   * @param {number} playerId - The ID of the player
   * @returns {Promise<PlayerSnapshot|null>}
   */
  static async getLatestSnapshot(playerId) {
    const result = await knex('player_snapshots')
      .where({ player_id: playerId })
      .orderBy('created_at', 'desc')
      .first();

    return result ? new PlayerSnapshot(result) : null;
  }

  /**
   * Get snapshot by ID
   * @param {number} snapshotId - The ID of the snapshot
   * @returns {Promise<PlayerSnapshot|null>}
   */
  static async findById(snapshotId) {
    const result = await knex('player_snapshots')
      .where({ id: snapshotId })
      .first();

    return result ? new PlayerSnapshot(result) : null;
  }
}

module.exports = PlayerSnapshot;
