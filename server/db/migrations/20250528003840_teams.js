/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// Represents a soccer club/team
exports.up = function (knex) {
  return knex.schema.createTable("teams", (table) => {
    table.increments("id").primary(); // Unique ID for each team
    table.string("name").notNullable(); // Team name
    

    // Team attribute ratings based on aggregate player performance
    table.integer("def_rating").defaultTo(50); // Defensive strength
    table.integer("mid_rating").defaultTo(50); // Midfield control
    table.integer("att_rating").defaultTo(50); // Offensive threat
    table.integer("team_rating").defaultTo(50); // Overall team strength

    table.timestamps(true, true); // created_at, updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("teams");
};
