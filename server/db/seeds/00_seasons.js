/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("seasons").del();
  
  await knex("seasons").insert([
    {
      name: "Season 2025",
      team_id: 1,
      start_date: "2025-02-07",
      end_date: "2025-08-15",
      created_at: knex.fn.now(),
    },
  ]);
  
  // Reset the auto-increment sequence to prevent future conflicts
  await knex.raw(`SELECT setval('seasons_id_seq', (SELECT MAX(id) FROM seasons));`);
};
