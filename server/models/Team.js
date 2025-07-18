// Import the Knex database instance
const knex = require('../db/knex');

// Define the Team class to encapsulate team logic
class Team {
  // Constructor to create an instance of a Team
  constructor({ id, name, coach_id }) {
    this.id = id;          // Unique ID of the team
    this.name = name;      // Name of the team
    this.coach_id = coach_id; // ID of the coach who created the team
  }

  // Fetch all teams from the database
  static async list() {
    const query = `SELECT * FROM teams`; // SQL query to get all rows from teams
    const result = await knex.raw(query); // Execute the query using Knex
    return result.rows.map((rawTeam) => new Team(rawTeam)); // Convert each row into a Team instance
  }

  // Create a new team with a name
  static async create(name) {
  const [team] = await knex('teams')
    .insert({ name })
    .returning('*');
  return team;
}
}

// Export the Team model so it can be used in controllers
module.exports = Team;
