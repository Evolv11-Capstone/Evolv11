/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("seasons", (table) => {
      table.increments("id").primary();

      table
        .integer("team_id")
        .unsigned()
        .references("id")
        .inTable("teams")
        .onDelete("CASCADE");

      table.string("name").notNullable(); // e.g. "Spring 2025"
      table.date("start_date").notNullable();
      table.date("end_date").notNullable();
      table.boolean("is_active").defaultTo(false); // convenience toggle

      table.timestamps(true, true);
    })
    .then(() =>
      knex.schema.alterTable("matches", (table) => {
        table
          .integer("season_id")
          .unsigned()
          .nullable() // avoid breaking existing rows
          .references("id")
          .inTable("seasons")
          .onDelete("SET NULL"); // protect existing match data
      })
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .alterTable("matches", (table) => {
      table.dropForeign("season_id");
      table.dropColumn("season_id");
    })
    .then(() => knex.schema.dropTable("seasons"));
};
