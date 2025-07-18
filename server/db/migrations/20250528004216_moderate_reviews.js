/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// Match performance input for solo coaches — quick and essential stats
exports.up = function (knex) {
  return knex.schema.createTable("moderate_reviews", (table) => {
    table.increments("id").primary();

    // Links to player and match
    table
      .integer("match_id")
      .unsigned()
      .references("id")
      .inTable("matches")
      .notNullable()
      .onDelete("CASCADE");
    table
      .integer("player_id")
      .unsigned()
      .references("id")
      .inTable("players")
      .notNullable()
      .onDelete("CASCADE");

    // Essential performance stats
    table.integer("goals").defaultTo(0).notNullable();
    table.integer("assists").defaultTo(0).notNullable();
    table.integer("saves").defaultTo(0).notNullable();
    table.integer("tackles").defaultTo(0).notNullable();
    table.integer("interceptions").defaultTo(0).notNullable();
    table.integer("chances_created").defaultTo(0).notNullable();
    table.integer("minutes_played").defaultTo(0).notNullable(); // Total minutes played in match
    table.integer("coach_rating").defaultTo(0).notNullable(); // Manual input

    table.timestamps(true, true);
  });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("moderate_reviews");
};
