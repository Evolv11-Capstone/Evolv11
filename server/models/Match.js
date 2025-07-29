// server/models/Match.js
const db = require('../db/knex');

const Match = {
    // Create a new match
  create: async ({ team_id, opponent, team_score, opponent_score, match_date }) => {
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
