/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("player_team_requests", (table) => {
    table.increments("id").primary();

    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table
      .integer("team_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("teams")
      .onDelete("CASCADE");

    table.string("status").defaultTo("pending");

    table.timestamps(true, true);

    // Add unique constraint to prevent duplicate requests per player/team
    table.unique(["user_id", "team_id"], "player_team_requests_user_team_unique");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("player_team_requests");
};
