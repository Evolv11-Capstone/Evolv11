// server/models/Match.js
const db = require('../db/knex');
const Season = require('./Season');

const Match = {
    // Create a new match with season validation
  create: async ({ team_id, season_id, opponent, team_score, opponent_score, match_date }) => {
    // Validate season exists and match date is within season bounds
    if (season_id) {
      const season = await Season.findById(season_id);
      
      if (!season) {
        throw new Error('Season not found');
      }

      // Validate that the match belongs to the same team as the season
      if (season.team_id !== team_id) {
        throw new Error('Season does not belong to the specified team');
      }

      // Validate match date is within season bounds
      const matchDate = new Date(match_date);
      const seasonStart = new Date(season.start_date);
      const seasonEnd = new Date(season.end_date);

      // Normalize dates to compare only date parts (remove time components)
      matchDate.setHours(0, 0, 0, 0);
      seasonStart.setHours(0, 0, 0, 0);
      seasonEnd.setHours(0, 0, 0, 0);

      if (matchDate < seasonStart || matchDate > seasonEnd) {
        throw new Error(
          `Match date ${match_date} is outside season bounds (${season.start_date} to ${season.end_date})`
        );
      }
    }

    return await db('matches')
      .insert({ team_id, season_id, opponent, team_score, opponent_score, match_date })
      .returning('*');
  },

  // Legacy create method for backward compatibility (without season validation)
  createLegacy: async ({ team_id, opponent, team_score, opponent_score, match_date }) => {
    return await db('matches')
      .insert({ team_id, opponent, team_score, opponent_score, match_date })
      .returning('*');
  },

    // Fetch all matches for a given team
  findByTeam: async (team_id) => {
    return await db('matches')
      .where({ team_id })
      .orderBy('match_date', 'desc');
  },

  // Fetch a single match by ID
  findById: async (id) => {
    const result = await db('matches').where({ id }).first();
    return result || null;
  },

  // Update a match
  update: async (id, updateData) => {
    const [updatedMatch] = await db('matches')
      .where({ id })
      .update(updateData)
      .returning('*');
    return updatedMatch || null;
  },

  // Delete a match and all related data
  delete: async (id) => {
    const trx = await db.transaction();
    
    try {
      // Delete related data in proper order to maintain referential integrity
      
      // 1. Delete player snapshots related to this match
      await trx('player_snapshots').where({ match_id: id }).del();
      
      // 2. Delete moderate reviews related to this match
      await trx('moderate_reviews').where({ match_id: id }).del();
      
      // 3. Delete lineup players for lineups of this match
      const lineups = await trx('lineups').where({ match_id: id }).select('id');
      for (const lineup of lineups) {
        await trx('lineup_players').where({ lineup_id: lineup.id }).del();
      }
      
      // 4. Delete lineups for this match
      await trx('lineups').where({ match_id: id }).del();
      
      // 5. Finally delete the match
      const deletedCount = await trx('matches').where({ id }).del();
      
      await trx.commit();
      return deletedCount > 0;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  },
};

module.exports = Match;
