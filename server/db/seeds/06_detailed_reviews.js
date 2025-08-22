/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("detailed_reviews").del();
  
  // This table can remain empty for now - detailed reviews are created dynamically
  // If needed later, we can add comprehensive detailed review data
};
