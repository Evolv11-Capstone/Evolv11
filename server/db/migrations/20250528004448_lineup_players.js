/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// Links players to specific lineups and positions for analysis
exports.up = function (knex) {
  return knex.schema.createTable("lineup_players", (table) => {
    table.increments("id").primary();

    table
      .integer("lineup_id")
      .unsigned()
      .references("id")
      .inTable("lineups")
      .onDelete("CASCADE");
    table
      .integer("player_id")
      .unsigned()
      .references("id")
      .inTable("players")
      .onDelete("CASCADE");

    table.string("position"); // e.g., 'CB', 'ST', 'GK'

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("lineup_players");
};
