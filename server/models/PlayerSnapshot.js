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
    // Goalkeeper attributes
    this.diving = data.diving;
    this.handling = data.handling;
    this.kicking = data.kicking;
    this.created_at = data.created_at;
  }

  /**
   * Create a new player snapshot
   * @param {number} playerId - The ID of the player
   * @param {number|null} matchId - The ID of the match (null for initial snapshot)
   * @param {Object} attributes - Player attributes at this point in time
   * @param {Date|string|null} matchDate - Optional match date for timestamp alignment
   * @returns {Promise<PlayerSnapshot>}
   */
  static async create(playerId, matchId = null, attributes, matchDate = null) {
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
      // Goalkeeper attributes
      diving: attributes.diving,
      handling: attributes.handling,
      kicking: attributes.kicking,
    };

    // If match date is provided, use it for created_at alignment
    if (matchDate) {
      snapshotData.created_at = matchDate;
    }

    const [result] = await knex('player_snapshots')
      .insert(snapshotData)
      .returning('*');

    return new PlayerSnapshot(result);
  }

  /**
   * Create an initial snapshot for a newly approved player with baseline stats
   * @param {number} playerId - The ID of the player
   * @returns {Promise<PlayerSnapshot>}
   */
  static async createInitialSnapshot(playerId) {
    // Check if initial snapshot already exists
    const existingInitialSnapshot = await knex('player_snapshots')
      .where({ player_id: playerId, match_id: null })
      .first();

    if (existingInitialSnapshot) {
      console.log(`Initial snapshot already exists for player ${playerId}`);
      return new PlayerSnapshot(existingInitialSnapshot);
    }

    // Create snapshot with baseline attributes of 50 (match_id = null for initial)
    return await PlayerSnapshot.create(playerId, null, {
      shooting: 50,
      passing: 50,
      dribbling: 50,
      defense: 50,
      physical: 50,
      coach_grade: 50,
      overall_rating: 50,
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
