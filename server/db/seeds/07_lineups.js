/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("lineups").del();

  const formations = ["4-3-3", "4-4-2"];
  const lineups = [];

  for (let matchId = 1; matchId <= 25; matchId++) {
    const randomFormation = formations[Math.floor(Math.random() * formations.length)];
    lineups.push({
      match_id: matchId,
      team_id: 1,
      formation: randomFormation,
    });
  }

  await knex("lineups").insert(lineups);
  
  // Reset the auto-increment sequence to prevent future conflicts
  await knex.raw(`SELECT setval('lineups_id_seq', (SELECT MAX(id) FROM lineups));`);
};
