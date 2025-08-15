/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// Profile for each player, extending their user account with attributes
exports.up = function (knex) {
  return knex.schema.createTable("players", (table) => {
    table.increments("id").primary();

    // Links back to the corresponding user account
    table
      .integer("user_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // Team the player belongs to
    table
      .integer("team_id")
      .unsigned()
      .references("id")
      .inTable("teams")
      .onDelete("CASCADE");

    // Main performance attributes, updated based on match data
    table.integer("shooting").defaultTo(50);
    table.integer("passing").defaultTo(50); // player or goalie passing ability
    table.integer("dribbling").defaultTo(50);
    table.integer("defense").defaultTo(50);
    table.integer("physical").defaultTo(50);
    table.integer("diving").defaultTo(50); // Goalkeeper diving ability
    table.integer("handling").defaultTo(50); // Goalkeeper handling ability
    table.integer("kicking").defaultTo(50); // Goalkeeper kicking ability
    table.integer("coach_grade").defaultTo(50); // Coach subjective rating
    table.integer("overall_rating").defaultTo(50); // Calculated average of core attributes

    table.string("position").defaultTo("TBD"); // Player's position (e.g. Forward, Midfielder, Defender, Goalkeeper)

    table.string("coach_feedback").defaultTo(""); // Coach's feedback on player performance
    table.string("ai_suggestions").defaultTo(""); // AI-generated suggestions for player improvement

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("players");
};
