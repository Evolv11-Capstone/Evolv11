/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("seasons").del();
  
  await knex("seasons").insert([
    {
      name: "Season 2024-25",
      team_id: 1,
      start_date: "2024-08-01",
      end_date: "2025-07-28",
      created_at: knex.fn.now(),
    },
  ]);
  
  // Reset the auto-increment sequence to prevent future conflicts
  await knex.raw(`SELECT setval('seasons_id_seq', (SELECT MAX(id) FROM seasons));`);
};
