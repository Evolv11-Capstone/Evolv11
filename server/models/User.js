const knex = require('../db/knex');          // Import knex instance for DB access
const bcrypt = require('bcryptjs'); // Library for hashing passwords
const SALT_ROUNDS = 12;                      // Number of salt rounds for hashing

class User {
  // Private property to prevent exposing the password hash
  #passwordHash = null;

  /**
   * Constructor: builds a User instance from raw DB data
   * @param {object} userData - Object with user fields from DB
   */
  constructor({ id, name, email, age, nationality, role, password_hash }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.age = age;
    this.nationality = nationality;
    this.role = role;
    this.#passwordHash = password_hash;
  }

  /**
   * Instance method to verify a password against stored hash
   * @param {string} password - Plain text password
   */
  isValidPassword = async (password) => {
    return await bcrypt.compare(password, this.#passwordHash);
  };

  /**
   * Create a new user with hashed password
   * @param {object} data - New user data including password
   */
  static async create({ name, email, age, nationality, role, password }) {
    // Hash password securely
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user into database and return raw result
    const result = await knex.raw(`
      INSERT INTO users (name, email, age, nationality, role, password_hash)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `, [name, email, age, nationality, role, passwordHash]);

    // Return new User instance with protected password
    return new User(result.rows[0]);
  }

  /**
   * Return a list of all users (password excluded)
   */
  static async list() {
    const result = await knex.raw(`SELECT * FROM users`);
    return result.rows.map((userData) => new User(userData));
  }

  /**
   * Find a user by ID
   * @param {number} id - User ID
   */
  static async find(id) {
    const result = await knex.raw(`SELECT * FROM users WHERE id = ?`, [id]);
    const userData = result.rows[0];
    return userData ? new User(userData) : null;
  }

  /**
   * Find a user by email (used during login or duplicate checks)
   * @param {string} email
   */
  static async findByEmail(email) {
    const result = await knex.raw(`SELECT * FROM users WHERE email = ?`, [email]);
    const userData = result.rows[0];
    return userData ? new User(userData) : null;
  }

  /**
   * Update user fields; only modifies provided fields
   * @param {number} id - ID of user to update
   * @param {object} updates - Fields to update
   */
  static async update(id, updates) {
    // Build dynamic SET clause and values array
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) {
        fields.push(`${key} = $${index++}`);
        values.push(val);
      }
    }

    if (fields.length === 0) return null; // Nothing to update

    // Final query
    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING *
    `;
    values.push(id); // Add ID to end of values array

    const result = await knex.raw(query, values);
    const updated = result.rows[0];
    return updated ? new User(updated) : null;
  }

  /**
   * Utility method to delete all users (optional/test)
   */
  static async deleteAll() {
    return knex('users').del();
  }
}

module.exports = User;
