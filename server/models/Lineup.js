// models/Lineup.js — handles CRUD operations for the lineups table
const db = require('../db/knex');

class Lineup {
 
  // Create or update (upsert) a lineup for a given match
  static async upsert({ team_id, match_id, formation }) {
    console.log(`🔍 Checking for existing lineup for match_id: ${match_id}`);

    // 1. Check if a lineup already exists for this match
    const existing = await db('lineups').where({ match_id }).first();

    if (existing) {
      console.log(`🛠 Existing lineup found (ID: ${existing.id}) — updating formation to '${formation}' and clearing old assignments.`);

      // 2. Delete previous player assignments for this lineup
      await db('lineup_players')
        .where({ lineup_id: existing.id })
        .del();

      // 3. Update the existing lineup formation
      const [updated] = await db('lineups')
        .where({ id: existing.id })
        .update({ formation })
        .returning('*');

      console.log(`✅ Formation updated successfully. Updated lineup:`, updated);
      return updated;
    }

    // 4. If no lineup exists, insert a new one
    console.log(`📦 No existing lineup found. Creating new lineup with formation '${formation}'`);
    const [inserted] = await db('lineups')
      .insert({ team_id, match_id, formation })
      .returning('*');

    console.log(`✅ New lineup created:`, inserted);
    return inserted;
  }


  // Fetch the lineup for a given match_id
  static async findByMatch(match_id) {
    return await db('lineups').where({ match_id }).first();
  }

  // Fetch a lineup by ID
  static async findById(id) {
    return await db('lineups').where({ id }).first();
  }

  // Optional: update the formation if needed separately
  static async updateFormation(id, newFormation) {
    const [updated] = await db('lineups')
      .where({ id })
      .update({ formation: newFormation })
      .returning('*');

    return updated;
  }
}

module.exports = Lineup;

