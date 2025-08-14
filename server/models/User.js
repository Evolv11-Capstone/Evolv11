const knex = require('../db/knex'); // Import Knex instance for DB queries
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing

const SALT_ROUNDS = 12; // Defines strength of bcrypt hashing

class User {
  // Private field to protect access to password hash
  #passwordHash = null;

  /**
   * Constructor: Initializes a User instance from DB row data
   * @param {object} userData - Raw user row data from database
   */
  constructor({ id, name, email, birthday, nationality, role, password_hash, image_url, height, preferred_position, created_at }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.birthday = birthday;
    this.nationality = nationality;
    this.role = role;
    this.height = height;
    this.preferred_position = preferred_position;
    this.image_url = image_url || null; // Optional field for player image
    this.#passwordHash = password_hash;
    this.created_at = created_at || new Date(); // Use provided or default to current time
  }

  /**
   * Instance method to verify input password against stored hash
   * @param {string} password - Plain text password from login input
   * @returns {Promise<boolean>} - True if password is valid
   */
  isValidPassword = async (password) => {
    return await bcrypt.compare(password, this.#passwordHash);
  };

  /**
   * Create a new user in the database
   * @param {object} data - New user data including password and optional image_url
   * @returns {Promise<User>} - Created User instance
   */
  static async create({ name, email, birthday, nationality, role, password, image_url, height, preferred_position, created_at }) {
    // Step 1: Securely hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Step 2: For coaches, provide default values for player-specific fields
    const finalHeight = (role === 'coach' || !height) ? 'N/A' : height;
    const finalPreferredPosition = (role === 'coach' || !preferred_position) ? 'N/A' : preferred_position;

    // Step 3: Insert the new user into the database
    const result = await knex.raw(`
      INSERT INTO users (name, email, birthday, nationality, role, password_hash, image_url, height, preferred_position, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `, [name, email, birthday, nationality, role, passwordHash, image_url, finalHeight, finalPreferredPosition, created_at || null]);

    // Step 4: Return new User instance
    return new User(result.rows[0]);
  }

  /**
   * Get all users (excluding password hash)
   * @returns {Promise<User[]>}
   */
  static async list() {
    const result = await knex.raw(`SELECT * FROM users`);
    return result.rows.map((userData) => new User(userData));
  }

  /**
   * Find a user by ID
   * @param {number} id - ID of user to retrieve
   * @returns {Promise<User|null>}
   */
  static async find(id) {
    const result = await knex.raw(`SELECT * FROM users WHERE id = ?`, [id]);
    const userData = result.rows[0];
    return userData ? new User(userData) : null;
  }

  /**
   * Find a user by email
   * @param {string} email - Email address to query
   * @returns {Promise<User|null>}
   */
  static async findByEmail(email) {
    const result = await knex.raw(`SELECT * FROM users WHERE email = ?`, [email]);
    const userData = result.rows[0];
    return userData ? new User(userData) : null;
  }

  /**
   * Update any fields for a given user ID
   * @param {number} id - ID of user to update
   * @param {object} updates - Fields and values to update
   * @returns {Promise<User|null>}
   */
  static async update(id, updates) {
    // Prepare dynamic SQL SET clause
    const fields = [];
    const values = [];

    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) {
        fields.push(`${key} = ?`);
        values.push(val);
      }
    }

    if (fields.length === 0) return null; // No update fields provided

    // Add the ID for the WHERE clause
    values.push(id);

    // Finalize and run query
    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = ?
      RETURNING *
    `;

    console.log('SQL Query:', query);
    console.log('SQL Values:', values);

    const result = await knex.raw(query, values);
    const updated = result.rows[0];
    return updated ? new User(updated) : null;
  }

  /**
   * Update a user's password
   * @param {number} id - ID of user to update
   * @param {string} newPassword - New plain text password
   * @returns {Promise<boolean>} - Success status
   */
  static async updatePassword(id, newPassword) {
    try {
      // Hash the new password
      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      
      // Update password in database
      const result = await knex.raw(`
        UPDATE users 
        SET password_hash = ? 
        WHERE id = ?
        RETURNING id
      `, [passwordHash, id]);

      return result.rows.length > 0;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  }

  /**
   * Delete all users (for testing or admin cleanup)
   * @returns {Promise<number>} - Number of rows deleted
   */
  static async deleteAll() {
    return knex('users').del();
  }
}

module.exports = User;
