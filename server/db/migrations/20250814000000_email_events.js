/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("email_events", (table) => {
    table.increments("id").primary();
    table.integer("user_id").notNullable();
    table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE");
    
    table.string("email_type").notNullable(); // 'welcome', 'password_reset', etc.
    table.string("provider").notNullable(); // 'postmark', 'sendgrid', 'ses'
    table.string("provider_message_id").nullable(); // Provider's message ID
    table.string("status").notNullable(); // 'sent', 'failed', 'bounced', 'complained'
    table.text("error_message").nullable(); // Error details if failed
    table.string("recipient_email").notNullable(); // Email address sent to
    
    table.timestamps(true, true);
    
    // Index for quick lookups
    table.index(['user_id', 'email_type']);
    table.index(['status']);
    table.index(['provider_message_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("email_events");
};
