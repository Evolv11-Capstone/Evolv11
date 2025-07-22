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
};

module.exports = Match;
