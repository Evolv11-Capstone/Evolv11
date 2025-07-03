/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("lineups").del();

  await knex("lineups").insert([
    {
      match_id: 1,
      team_id: 1,
      formation: "4-3-3", // Common formation
    },
    // Uncomment and adapt this if you have a second team
    // {
    //   match_id: 1,
    //   team_id: 2,
    //   formation: "4-2-3-1",
    // },
  ]);
};
