/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("player_snapshots", (table) => {
    table.increments("id").primary();
    table.integer("player_id").unsigned().references("id").inTable("players").onDelete("CASCADE");
    table.integer("match_id").unsigned().references("id").inTable("matches").onDelete("CASCADE");

    table.integer("shooting").notNullable();
    table.integer("passing").notNullable();
    table.integer("dribbling").notNullable();
    table.integer("defense").notNullable();
    table.integer("physical").notNullable();
    table.integer("diving").notNullable(); // Total saves in match
    table.integer("kicking").notNullable(); // Total successful goalie kicks in match
    table.integer("handling").notNullable(); // Total successful goalie throws in match
    table.integer("coach_grade").notNullable();
    table.integer("overall_rating").notNullable();

    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable("player_snapshots");
};
  
