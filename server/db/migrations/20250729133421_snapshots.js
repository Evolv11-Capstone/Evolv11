/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("player_snapshots", (table) => {
    table.increments("id").primary();

    table
      .integer("player_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("players")
      .onDelete("CASCADE");

    table
      .integer("match_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("matches")
      .onDelete("CASCADE");

    // Attribute snapshots (0–100)
    table.integer("shooting").notNullable();
    table.integer("passing").notNullable();
    table.integer("dribbling").notNullable();
    table.integer("defense").notNullable();
    table.integer("physical").notNullable();

    // Goalkeeper attributes (0–100)
    table.integer("diving").notNullable();
    table.integer("kicking").notNullable();
    table.integer("handling").notNullable();

    table.integer("coach_grade").notNullable();
    table.integer("overall_rating").notNullable();

    // Use match date for timeline alignment; app sets this to matches.match_date
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    // One snapshot per player per match
    table.unique(["player_id", "match_id"]);

    // Optional: guard rails (Postgres CHECK constraints)
    table.check("shooting BETWEEN 0 AND 100");
    table.check("passing BETWEEN 0 AND 100");
    table.check("dribbling BETWEEN 0 AND 100");
    table.check("defense BETWEEN 0 AND 100");
    table.check("physical BETWEEN 0 AND 100");
    table.check("diving BETWEEN 0 AND 100");
    table.check("kicking BETWEEN 0 AND 100");
    table.check("handling BETWEEN 0 AND 100");
    table.check("coach_grade BETWEEN 0 AND 100");
    table.check("overall_rating BETWEEN 0 AND 100");
  });

  // Helpful index for timelines
  await knex.schema.raw(
    'CREATE INDEX IF NOT EXISTS player_snapshots_player_created_idx ON player_snapshots(player_id, created_at);'
  );
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("player_snapshots");
};
