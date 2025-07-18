/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("teams").del();
  await knex("teams").insert([
    {
      id: 1,
      name: "Evolv United", // starting baseline
      def_rating: 50,
      mid_rating: 50,
      att_rating: 50,
      team_rating: 50,
    },
  ]);
};
