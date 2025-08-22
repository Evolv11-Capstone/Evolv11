/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("detailed_reviews", (table) => {
    table.increments("id").primary();

    // Links to match and player
    table
      .integer("match_id")
      .unsigned()
      .references("id")
      .inTable("matches")
      .onDelete("CASCADE");
    table
      .integer("player_id")
      .unsigned()
      .references("id")
      .inTable("players")
      .onDelete("CASCADE");

    // Basic and advanced stats
    table.integer("minutes_played").defaultTo(0);
    table.integer("goals").defaultTo(0);
    table.integer("assists").defaultTo(0);
    table.integer("saves").defaultTo(0);
    table.integer("tackles").defaultTo(0);
    table.integer("interceptions").defaultTo(0);
    table.integer("chances_created").defaultTo(0);
    table.integer("coach_rating").defaultTo(0); // Coach subjective rating

    // Shooting stats
    table.integer("shots_on_target").defaultTo(0);
    table.integer("shots_off_target").defaultTo(0);

    // Passing stats
    table.integer("passes_completed").defaultTo(0);
    table.integer("passes_attempted").defaultTo(0);

    // Duel stats
    table.integer("dribble_duels_won").defaultTo(0);
    table.integer("dribble_duels_lost").defaultTo(0);
    table.integer("defensive_duels_won").defaultTo(0);
    table.integer("defensive_duels_lost").defaultTo(0);

    // Additional metrics for depth
    table.integer("fouls_committed").defaultTo(0);
    table.integer("fouls_suffered").defaultTo(0);
    table.integer("yellow_cards").defaultTo(0);
    table.integer("red_cards").defaultTo(0);
    table.integer("offsides").defaultTo(0);
    table.integer("clearances").defaultTo(0);
    table.integer("aerial_duels_won").defaultTo(0);
    table.integer("aerial_duels_lost").defaultTo(0);

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("detailed_reviews");
};
