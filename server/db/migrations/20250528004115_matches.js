/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// Represents each match played by a team
exports.up = function (knex) {
  return knex.schema.createTable("matches", (table) => {
    table.increments("id").primary();

    table
      .integer("team_id")
      .unsigned()
      .references("id")
      .inTable("teams")
      .onDelete("CASCADE");
    table.string("opponent"); // Name of opposing team
    table.date("match_date");
    table.integer("team_score"); // Goals scored by team
    table.integer("opponent_score"); // Goals conceded

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("matches");
};
