const db = require('../db/knex');

const Season = {
  /**
   * Find a season by ID
   * @param {number} season_id - The season ID
   * @returns {Promise<Object|null>} The season object or null if not found
   */
  findById: async (season_id) => {
    const result = await db('seasons').where({ id: season_id }).first();
    return result || null;
  },

  /**
   * Get all seasons for a specific team
   * @param {number} team_id - The team ID
   * @returns {Promise<Array>} Array of season objects
   */
  getTeamSeasons: async (team_id) => {
    return await db('seasons')
      .where({ team_id })
      .orderBy('start_date', 'desc');
  },

  /**
   * Create a new season
   * @param {Object} seasonData - Season data
   * @param {number} seasonData.team_id - The team ID
   * @param {string} seasonData.name - Season name (e.g., "Spring 2025")
   * @param {string} seasonData.start_date - Season start date (YYYY-MM-DD)
   * @param {string} seasonData.end_date - Season end date (YYYY-MM-DD)
   * @returns {Promise<Object>} The created season object
   */
  create: async ({ team_id, name, start_date, end_date }) => {
    // Validate date range
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (startDate >= endDate) {
      throw new Error('Season start date must be before end date');
    }

    // Check for overlapping seasons for the same team
    const overlappingSeason = await db('seasons')
      .where({ team_id })
      .where(function() {
        this.whereBetween('start_date', [start_date, end_date])
          .orWhereBetween('end_date', [start_date, end_date])
          .orWhere(function() {
            this.where('start_date', '<=', start_date)
              .andWhere('end_date', '>=', end_date);
          });
      })
      .first();

    if (overlappingSeason) {
      throw new Error('Season dates overlap with existing season: ' + overlappingSeason.name);
    }

    const [newSeason] = await db('seasons')
      .insert({ team_id, name, start_date, end_date })
      .returning('*');
    
    return newSeason;
  },

  /**
   * Update season active status
   * @param {number} season_id - The season ID
   * @param {boolean} is_active - Active status
   * @returns {Promise<Object|null>} Updated season or null
   */
  updateActiveStatus: async (season_id, is_active) => {
    const [updatedSeason] = await db('seasons')
      .where({ id: season_id })
      .update({ is_active })
      .returning('*');
    
    return updatedSeason || null;
  },

  /**
   * Delete a season and all associated data (cascading delete)
   * @param {number} season_id - The season ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  delete: async (season_id) => {
    const trx = await db.transaction();
    
    try {
      // Get all matches for this season
      const matches = await trx('matches').where({ season_id }).select('id');
      
      for (const match of matches) {
        // Delete related data for each match in proper order
        
        // 1. Delete player snapshots related to this match
        await trx('player_snapshots').where({ match_id: match.id }).del();
        
        // 2. Delete moderate reviews related to this match
        await trx('moderate_reviews').where({ match_id: match.id }).del();
        
        // 3. Delete lineup players for lineups of this match
        const lineups = await trx('lineups').where({ match_id: match.id }).select('id');
        for (const lineup of lineups) {
          await trx('lineup_players').where({ lineup_id: lineup.id }).del();
        }
        
        // 4. Delete lineups for this match
        await trx('lineups').where({ match_id: match.id }).del();
      }
      
      // 5. Delete all matches for this season
      await trx('matches').where({ season_id }).del();
      
      // 6. Finally delete the season
      const deletedCount = await trx('seasons').where({ id: season_id }).del();
      
      await trx.commit();
      return deletedCount > 0;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  },

  /**
   * Delete a season (only if no matches are associated) - Legacy method
   * @param {number} season_id - The season ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  deleteIfEmpty: async (season_id) => {
    // Check if any matches are associated with this season
    const matchCount = await db('matches').where({ season_id }).count('id as count');
    
    if (matchCount[0].count > 0) {
      throw new Error('Cannot delete season with associated matches');
    }

    const deletedCount = await db('seasons').where({ id: season_id }).del();
    return deletedCount > 0;
  }
};

module.exports = Season;
