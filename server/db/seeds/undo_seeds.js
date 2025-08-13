/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Use TRUNCATE with RESTART IDENTITY and CASCADE to fully reset
  await knex.raw(`
    TRUNCATE 
      player_snapshots,
      moderate_reviews,
      lineup_players,
      lineups,
      matches,
      seasons
    RESTART IDENTITY CASCADE
  `);

  // Reset auto-incrementing sequences to ensure proper next values
  // Use GREATEST to ensure minimum value of 1 for PostgreSQL sequences
  await knex.raw(`SELECT setval('matches_id_seq', GREATEST((SELECT COALESCE(MAX(id), 0) FROM matches), 1));`);
  await knex.raw(`SELECT setval('seasons_id_seq', GREATEST((SELECT COALESCE(MAX(id), 0) FROM seasons), 1));`);

  console.log('✅ Tables truncated and identities reset.');
};
