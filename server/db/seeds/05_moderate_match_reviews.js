/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("moderate_reviews").del();

  await knex("moderate_reviews").insert([
    {
      match_id: 1,
      player_id: 1, // Thibaut Courtois (GK)
      minutes_played: 90,
      goals: 0,
      assists: 0,
      tackles: 0,
      interceptions: 0,
      saves: 6,
      chances_created: 0,
      coach_rating: 8,
    },
    {
      match_id: 1,
      player_id: 2, // Trent Alexander-Arnold (DEF)
      minutes_played: 90,
      goals: 0,
      assists: 1,
      tackles: 3,
      interceptions: 2,
      saves: 0,
      chances_created: 2,
      coach_rating: 7,
    },
    {
      match_id: 1,
      player_id: 3, // Virgil van Dijk (DEF)
      minutes_played: 90,
      goals: 0,
      assists: 0,
      tackles: 4,
      interceptions: 3,
      saves: 0,
      chances_created: 0,
      coach_rating: 8,
    },
    {
      match_id: 1,
      player_id: 4, // Jules Koundé (DEF)
      minutes_played: 90,
      goals: 0,
      assists: 0,
      tackles: 3,
      interceptions: 2,
      saves: 0,
      chances_created: 1,
      coach_rating: 7,
    },
    {
      match_id: 1,
      player_id: 5, // Andrew Robertson (DEF)
      minutes_played: 90,
      goals: 0,
      assists: 1,
      tackles: 2,
      interceptions: 1,
      saves: 0,
      chances_created: 2,
      coach_rating: 7,
    },
    {
      match_id: 1,
      player_id: 6, // Luka Modric (MID)
      minutes_played: 90,
      goals: 0,
      assists: 2,
      tackles: 3,
      interceptions: 2,
      saves: 0,
      chances_created: 5,
      coach_rating: 9,
    },
    {
      match_id: 1,
      player_id: 7, // Kevin De Bruyne (MID)
      minutes_played: 90,
      goals: 1,
      assists: 1,
      tackles: 1,
      interceptions: 1,
      saves: 0,
      chances_created: 4,
      coach_rating: 8,
    },
    {
      match_id: 1,
      player_id: 8, // Jude Bellingham (MID)
      minutes_played: 90,
      goals: 1,
      assists: 0,
      tackles: 2,
      interceptions: 1,
      saves: 0,
      chances_created: 3,
      coach_rating: 8,
    },
    {
      match_id: 1,
      player_id: 9, // Joshua Kimmich (MID)
      minutes_played: 90,
      goals: 0,
      assists: 1,
      tackles: 3,
      interceptions: 2,
      saves: 0,
      chances_created: 2,
      coach_rating: 8,
    },
    {
      match_id: 1,
      player_id: 10, // Leo Messi (FWD)
      minutes_played: 90,
      goals: 2,
      assists: 1,
      tackles: 1,
      interceptions: 0,
      saves: 0,
      chances_created: 4,
      coach_rating: 9,
    },
    {
      match_id: 1,
      player_id: 11, // Erling Haaland (FWD)
      minutes_played: 90,
      goals: 1,
      assists: 0,
      tackles: 1,
      interceptions: 1,
      saves: 0,
      chances_created: 2,
      coach_rating: 8,
    },
  ]);
};
