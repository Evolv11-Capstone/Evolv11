/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("players").del();

  await knex("players").insert([
    { user_id: 2, team_id: 1 }, // Thibaut Courtois (GK)
    { user_id: 3, team_id: 1 }, // Trent Alexander-Arnold (DEF)
    { user_id: 4, team_id: 1 }, // Virgil van Dijk (DEF)
    { user_id: 5, team_id: 1 }, // Jules Koundé (DEF)
    { user_id: 6, team_id: 1 }, // Andrew Robertson (DEF)
    { user_id: 7, team_id: 1 }, // Luka Modric (MID)
    { user_id: 8, team_id: 1 }, // Kevin De Bruyne (MID)
    { user_id: 9, team_id: 1 }, // Jude Bellingham (MID)
    { user_id: 10, team_id: 1 }, // Joshua Kimmich (MID)
    { user_id: 11, team_id: 1 }, // Leo Messi (FWD)
    { user_id: 12, team_id: 1 }, // Erling Haaland (FWD)
    { user_id: 13, team_id: 1 }, // Kylian Mbappe (FWD)
  ]);
};
