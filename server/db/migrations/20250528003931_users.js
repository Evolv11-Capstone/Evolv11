/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// Represents all user accounts in the system
exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("name"); // User's full name
    table.string("age").notNullable(); // User's age, stored as a string (e.g., "25")
    table.string("nationality").notNullable(); // User's nationality
    table.string("email").unique().notNullable(); // Login email
    table.string("password_hash").notNullable(); // Hashed password
    table.string("role").notNullable(); // 'coach', 'player', or 'scout'
    // image_url is only available for players
    table.string("image_url").nullable();



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
