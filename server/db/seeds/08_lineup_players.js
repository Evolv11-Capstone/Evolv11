/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("lineup_players").del();

  await knex("lineup_players").insert([
    { lineup_id: 1, player_id: 1, position: "GK" }, // Thibaut Courtois
    { lineup_id: 1, player_id: 2, position: "RB" }, // Trent Alexander-Arnold
    { lineup_id: 1, player_id: 3, position: "CB" }, // Virgil van Dijk
    { lineup_id: 1, player_id: 4, position: "CB" }, // Jules Koundé
    { lineup_id: 1, player_id: 5, position: "LB" }, // Andrew Robertson
    { lineup_id: 1, player_id: 6, position: "CM" }, // Luka Modric
    { lineup_id: 1, player_id: 7, position: "CAM" }, // Kevin De Bruyne
    { lineup_id: 1, player_id: 8, position: "CM" }, // Jude Bellingham
    { lineup_id: 1, player_id: 9, position: "RW" }, // Joshua Kimmich (can be adjusted)
    { lineup_id: 1, player_id: 10, position: "LW" }, // Leo Messi
    { lineup_id: 1, player_id: 11, position: "ST" }, // Erling Haaland
  ]);
};
