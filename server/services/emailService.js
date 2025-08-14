const EmailEvent = require('../models/EmailEvent');

class EmailService {
  constructor() {
    this.provider = this.getProvider();
    this.isEnabled = this.isEmailEnabled();
  }

  /**
   * Determine which email provider to use
   * @returns {object} Provider configuration
   */
  getProvider() {
    if (process.env.POSTMARK_API_KEY) {
      return { name: 'postmark', apiKey: process.env.POSTMARK_API_KEY };
    } else if (process.env.SENDGRID_API_KEY) {
      return { name: 'sendgrid', apiKey: process.env.SENDGRID_API_KEY };
    } else if (process.env.AWS_SES_REGION) {
      return { name: 'ses', region: process.env.AWS_SES_REGION };
    }
    return null;
  }

  /**
   * Check if email service is enabled
   * @returns {boolean}
   */
  isEmailEnabled() {
    return this.provider !== null;
  }

  /**
   * Send welcome email to new user
   * @param {object} user - User object
   * @returns {Promise<EmailEvent|null>}
   */
  async sendWelcomeEmail(user) {
    if (!this.isEnabled) {
      console.log('Email service disabled - no API keys configured');
      return null;
    }

    // Check if welcome email already sent
    const alreadySent = await EmailEvent.hasWelcomeEmailBeenSent(user.id);
    if (alreadySent) {
      console.log(`Welcome email already sent to user ${user.id}`);
      return null;
    }

    try {
      // Create initial email event record
      const emailEvent = await EmailEvent.create({
        user_id: user.id,
        email_type: 'welcome',
        provider: this.provider.name,
        status: 'sending',
        recipient_email: user.email
      });

      // Generate email content based on user role
      const { subject, htmlContent } = this.generateWelcomeEmail(user);

      // Send email via provider
      const providerResponse = await this.sendViaProvider({
        to: user.email,
        subject: subject,
        html: htmlContent
      });

      // Update email event with provider response
      await EmailEvent.update(emailEvent.id, {
        provider_message_id: providerResponse.messageId,
        status: 'sent'
      });

      console.log(`Welcome email sent to ${user.email} via ${this.provider.name}`);
      return emailEvent;

    } catch (error) {
      console.error('Failed to send welcome email:', error);
      
      // Update email event with error
      if (emailEvent) {
        await EmailEvent.update(emailEvent.id, {
          status: 'failed',
          error_message: error.message
        });
      }
      
      throw error;
    }
  }

  /**
   * Generate welcome email content based on user role
   * @param {object} user - User object
   * @returns {object} Subject and HTML content
   */
  generateWelcomeEmail(user) {
    const appName = process.env.APP_NAME || 'Clean Evolution';
    const isCoach = user.role === 'coach';
    
    const subject = `Welcome to ${appName}!`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${appName}</title>
          <style>
              body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  margin: 0;
                  padding: 0;
                  background-color: #f5f5f5;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background: white;
                  padding: 40px 30px;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                  margin-top: 20px;
              }
              .header {
                  text-align: center;
                  margin-bottom: 30px;
              }
              .logo {
                  background: #1a4d3a;
                  color: white;
                  padding: 15px 25px;
                  border-radius: 8px;
                  display: inline-block;
                  font-size: 24px;
                  font-weight: bold;
                  margin-bottom: 20px;
              }
              .content {
                  font-size: 16px;
                  margin-bottom: 30px;
              }
              .highlight {
                  background: #f0f8f5;
                  padding: 20px;
                  border-radius: 6px;
                  border-left: 4px solid #1a4d3a;
                  margin: 20px 0;
              }
              .cta-button {
                  background: #1a4d3a;
                  color: white;
                  padding: 15px 30px;
                  text-decoration: none;
                  border-radius: 6px;
                  display: inline-block;
                  font-weight: bold;
                  margin: 20px 0;
              }
              .footer {
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 1px solid #eee;
                  font-size: 14px;
                  color: #666;
                  text-align: center;
              }
              ul {
                  padding-left: 20px;
              }
              li {
                  margin-bottom: 8px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">${appName}</div>
                  <h1>Welcome ${isCoach ? 'Coach' : ''} ${user.first_name}!</h1>
              </div>
              
              <div class="content">
                  <p>We're thrilled to have you join the ${appName} community! Your account has been successfully created and you're now ready to ${isCoach ? 'start coaching your team' : 'begin your football journey'}.</p>
                  
                  <div class="highlight">
                      <h3>${isCoach ? '🏆 Coach Dashboard Ready' : '⚽ Your Player Profile'}</h3>
                      <p>${isCoach 
                          ? 'Your coaching dashboard is set up and ready. You can now create teams, manage lineups, track player progress, and analyze match performance.'
                          : 'Your player profile is live! Start building your stats, join teams, and track your development throughout the season.'
                      }</p>
                  </div>
                  
                  <h3>What you can do now:</h3>
                  <ul>
                      ${isCoach ? `
                          <li><strong>Create Your Team:</strong> Set up your squad and invite players</li>
                          <li><strong>Plan Lineups:</strong> Use our tactical board to create formations</li>
                          <li><strong>Track Performance:</strong> Monitor player stats and team progress</li>
                          <li><strong>Manage Seasons:</strong> Create competitions and track results</li>
                      ` : `
                          <li><strong>Complete Your Profile:</strong> Add your position, skills, and photo</li>
                          <li><strong>Join a Team:</strong> Connect with coaches and request to join teams</li>
                          <li><strong>Track Your Stats:</strong> Record your performance in matches</li>
                          <li><strong>Set Goals:</strong> Monitor your development over time</li>
                      `}
                  </ul>
                  
                  <div style="text-align: center;">
                      <a href="#" class="cta-button">
                          ${isCoach ? 'Open Coach Dashboard' : 'Complete Your Profile'}
                      </a>
                  </div>
                  
                  <p>If you have any questions or need help getting started, feel free to reach out to our support team. We're here to help you make the most of ${appName}!</p>
              </div>
              
              <div class="footer">
                  <p><strong>${appName}</strong> - Elevating Football Performance</p>
                  <p>This email was sent to ${user.email}. If you didn't create this account, please contact our support team.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    return { subject, htmlContent };
  }

  /**
   * Send email via configured provider
   * @param {object} emailData - Email data (to, subject, html)
   * @returns {Promise<object>} Provider response
   */
  async sendViaProvider(emailData) {
    switch (this.provider.name) {
      case 'postmark':
        return this.sendViaPostmark(emailData);
      case 'sendgrid':
        return this.sendViaSendGrid(emailData);
      case 'ses':
        return this.sendViaSES(emailData);
      default:
        throw new Error(`Unsupported email provider: ${this.provider.name}`);
    }
  }

  /**
   * Send email via Postmark
   */
  async sendViaPostmark(emailData) {
    const postmark = require('postmark');
    const client = new postmark.ServerClient(this.provider.apiKey);
    
    const response = await client.sendEmail({
      From: process.env.FROM_EMAIL || 'noreply@cleanevolution.com',
      To: emailData.to,
      Subject: emailData.subject,
      HtmlBody: emailData.html
    });

    return { messageId: response.MessageID };
  }

  /**
   * Send email via SendGrid
   */
  async sendViaSendGrid(emailData) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(this.provider.apiKey);

    const msg = {
      to: emailData.to,
      from: process.env.FROM_EMAIL || 'noreply@cleanevolution.com',
      subject: emailData.subject,
      html: emailData.html
    };

    const response = await sgMail.send(msg);
    return { messageId: response[0].headers['x-message-id'] };
  }

  /**
   * Send email via AWS SES
   */
  async sendViaSES(emailData) {
    const AWS = require('aws-sdk');
    const ses = new AWS.SES({ region: this.provider.region });

    const params = {
      Source: process.env.FROM_EMAIL || 'noreply@cleanevolution.com',
      Destination: { ToAddresses: [emailData.to] },
      Message: {
        Subject: { Data: emailData.subject },
        Body: { Html: { Data: emailData.html } }
      }
    };

    const response = await ses.sendEmail(params).promise();
    return { messageId: response.MessageId };
  }
}

module.exports = new EmailService();
