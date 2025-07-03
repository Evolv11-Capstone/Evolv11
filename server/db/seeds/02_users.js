/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const bcrypt = require("bcrypt");

exports.seed = async function (knex) {
  await knex("users").del();
  const hash = await bcrypt.hash("password123", 10);

  await knex("users").insert([
    // Coach
    {
      id: 1,
      name: "Coach Carter",
      email: "coach@evolv.com",
      password_hash: hash,
      role: "coach",
      team_id: 1,
    },

    // Goalkeeper
    {
      id: 2,
      name: "Thibaut Courtois",
      email: "courtois@evolv.com",
      password_hash: hash,
      role: "player",
      team_id: 1,
    },

    // Defenders
    {
      id: 3,
      name: "Trent Alexander-Arnold",
      email: "taa@evolv.com",
      password_hash: hash,
      role: "player",
      team_id: 1,
    },
    {
      id: 4,
      name: "Virgil van Dijk",
      email: "vvd@evolv.com",
      password_hash: hash,
      role: "player",
      team_id: 1,
    },
    {
      id: 5,
      name: "Jules Koundé",
      email: "kounde@evolv.com",
      password_hash: hash,
      role: "player",
      team_id: 1,
    },
    {
      id: 6,
      name: "Andrew Robertson",
      email: "robertson@evolv.com",
      password_hash: hash,
      role: "player",
      team_id: 1,
    },

    // Midfielders
    {
      id: 7,
      name: "Luka Modric",
      email: "modric@evolv.com",
      password_hash: hash,
      role: "player",
      team_id: 1,
    },
    {
      id: 8,
      name: "Kevin De Bruyne",
      email: "kdb@evolv.com",
      password_hash: hash,
      role: "player",
      team_id: 1,
    },
    {
      id: 9,
      name: "Jude Bellingham",
      email: "bellingham@evolv.com",
      password_hash: hash,
      role: "player",
      team_id: 1,
    },
    {
      id: 10,
      name: "Joshua Kimmich",
      email: "kimmich@evolv.com",
      password_hash: hash,
      role: "player",
      team_id: 1,
    },

    // Forwards
    {
      id: 11,
      name: "Leo Messi",
      email: "messi@evolv.com",
      password_hash: hash,
      role: "player",
      team_id: 1,
    },
    {
      id: 12,
      name: "Erling Haaland",
      email: "haaland@evolv.com",
      password_hash: hash,
      role: "player",
      team_id: 1,
    },
    {
      id: 13,
      name: "Kylian Mbappe",
      email: "mbappe@evolv.com",
      password_hash: hash,
      role: "player",
      team_id: 1,
    },
  ]);
};
