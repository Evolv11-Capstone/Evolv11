const knex = require('../db/knex');

class EmailEvent {
  constructor({ id, user_id, email_type, provider, provider_message_id, status, error_message, recipient_email, created_at, updated_at }) {
    this.id = id;
    this.user_id = user_id;
    this.email_type = email_type;
    this.provider = provider;
    this.provider_message_id = provider_message_id;
    this.status = status;
    this.error_message = error_message;
    this.recipient_email = recipient_email;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  /**
   * Create a new email event record
   * @param {object} eventData - Email event data
   * @returns {Promise<EmailEvent>}
   */
  static async create({ user_id, email_type, provider, provider_message_id, status, error_message, recipient_email }) {
    const result = await knex.raw(`
      INSERT INTO email_events (user_id, email_type, provider, provider_message_id, status, error_message, recipient_email)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `, [user_id, email_type, provider, provider_message_id, status, error_message, recipient_email]);

    return new EmailEvent(result.rows[0]);
  }

  /**
   * Update email event status (for webhooks)
   * @param {number} id - Email event ID
   * @param {object} updates - Fields to update
   * @returns {Promise<EmailEvent|null>}
   */
  static async update(id, updates) {
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) {
        fields.push(`${key} = $${index++}`);
        values.push(val);
      }
    }

    if (fields.length === 0) return null;

    const query = `
      UPDATE email_events
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${index}
      RETURNING *
    `;
    values.push(id);

    const result = await knex.raw(query, values);
    const updated = result.rows[0];
    return updated ? new EmailEvent(updated) : null;
  }

  /**
   * Find email event by provider message ID
   * @param {string} providerMessageId - Provider's message ID
   * @returns {Promise<EmailEvent|null>}
   */
  static async findByProviderMessageId(providerMessageId) {
    const result = await knex.raw(`
      SELECT * FROM email_events WHERE provider_message_id = ?
    `, [providerMessageId]);
    
    const eventData = result.rows[0];
    return eventData ? new EmailEvent(eventData) : null;
  }

  /**
   * Check if welcome email was already sent to user
   * @param {number} userId - User ID
   * @returns {Promise<boolean>}
   */
  static async hasWelcomeEmailBeenSent(userId) {
    const result = await knex.raw(`
      SELECT id FROM email_events 
      WHERE user_id = ? AND email_type = 'welcome' AND status IN ('sent', 'delivered')
      LIMIT 1
    `, [userId]);

    return result.rows.length > 0;
  }

  /**
   * Get email events for a user
   * @param {number} userId - User ID
   * @returns {Promise<EmailEvent[]>}
   */
  static async findByUserId(userId) {
    const result = await knex.raw(`
      SELECT * FROM email_events WHERE user_id = ? ORDER BY created_at DESC
    `, [userId]);

    return result.rows.map(eventData => new EmailEvent(eventData));
  }
}

module.exports = EmailEvent;
