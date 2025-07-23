/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// Tactical setup for a match: one lineup per team per match
exports.up = function (knex) {
  return knex.schema.createTable("lineups", (table) => {
    table.increments("id").primary();

    table.integer('match_id').unsigned().unique().notNullable()
    table
      .integer("team_id")
      .unsigned()
      .references("id")
      .inTable("teams")
      .onDelete("CASCADE");

    table.string("formation"); // e.g., '4-3-3', '3-5-2'

    table.timestamps(true, true);
  });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("lineups");
};
