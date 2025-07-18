/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("matches").del();
  await knex("matches").insert([
    { id: 1, opponent: "Alpha FC", match_date: "2025-05-25", team_id: 1 },
  ]);
};
