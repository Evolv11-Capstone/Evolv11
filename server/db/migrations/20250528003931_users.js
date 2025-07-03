/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// Represents all user accounts in the system
exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("name"); // User's full name
    table.string("email").unique().notNullable(); // Login email
    table.string("password_hash").notNullable(); // Hashed password
    table.string("role").notNullable(); // 'coach', 'player', or 'scout'

    // Coaches and players are linked to a team
    table
      .integer("team_id")
      .unsigned()
      .references("id")
      .inTable("teams")
      .onDelete("CASCADE");

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("users");
};
