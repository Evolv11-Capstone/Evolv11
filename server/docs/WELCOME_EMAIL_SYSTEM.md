# Welcome Email System Documentation

## Overview

The Clean Evolution app now includes a comprehensive welcome email system that automatically sends personalized emails to new users upon successful registration. The system supports multiple email providers, includes role-based email content, and provides detailed tracking and observability.

## Features

### ✅ **Multi-Provider Support**
- **Postmark** (Recommended for transactional emails)
- **SendGrid** (Popular email service)
- **AWS SES** (Cost-effective for high volume)

### ✅ **Role-Based Email Content**
- **Coach emails**: Focus on team management, lineup creation, and player tracking
- **Player emails**: Focus on profile completion, team joining, and stat tracking
- **Responsive HTML templates** with clean design

### ✅ **Email Tracking & Observability**
- Complete email event logging in database
- Webhook support for delivery status updates
- Provider message ID tracking
- Error handling and retry logic

### ✅ **Graceful Degradation**
- System continues to work even if email providers are not configured
- Non-blocking email sending (registration completes regardless of email status)
- Comprehensive error logging

## Database Schema

### Email Events Table
```sql
CREATE TABLE email_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    email_type VARCHAR(50) NOT NULL,
    provider VARCHAR(50),
    provider_message_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    recipient_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Status Values:**
- `pending` - Email queued for sending
- `sending` - Email being sent
- `sent` - Email successfully sent to provider
- `delivered` - Email delivered to recipient
- `bounced` - Email bounced
- `failed` - Send attempt failed
- `spam_complaint` - Marked as spam
- `opened` - Email opened by recipient
- `clicked` - Link clicked in email

## Configuration

### Environment Variables

Add ONE of the following provider configurations to your `.env` file:

#### Option 1: Postmark (Recommended)
```bash
POSTMARK_API_KEY=your_postmark_api_key_here
FROM_EMAIL=noreply@yourdomain.com
APP_NAME=Clean Evolution
```

#### Option 2: SendGrid
```bash
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@yourdomain.com
APP_NAME=Clean Evolution
```

#### Option 3: AWS SES
```bash
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
FROM_EMAIL=noreply@yourdomain.com
APP_NAME=Clean Evolution
```

### Provider Setup Instructions

#### Postmark Setup
1. Sign up at [https://postmarkapp.com/](https://postmarkapp.com/)
2. Create a server and get your API key
3. Verify your sender domain or email address
4. Add `POSTMARK_API_KEY` to your `.env` file

#### SendGrid Setup
1. Sign up at [https://sendgrid.com/](https://sendgrid.com/)
2. Create an API key with Mail Send permissions
3. Verify your sender domain or email address
4. Add `SENDGRID_API_KEY` to your `.env` file

#### AWS SES Setup
1. Configure AWS credentials (IAM user with SES permissions)
2. Verify your sender domain or email in AWS SES console
3. Move out of SES sandbox if needed for production
4. Add AWS credentials and region to your `.env` file

## Implementation Details

### Email Service Architecture

```
User Registration
       ↓
Auth Controller
       ↓
EmailService.sendWelcomeEmail()
       ↓
Database: EmailEvent.create()
       ↓
Provider API Call
       ↓
Database: EmailEvent.update()
       ↓
Webhook Updates (Optional)
```

### Key Components

1. **`EmailEvent.js`** - Database model for tracking email events
2. **`emailService.js`** - Core email service with provider abstraction
3. **`authControllers.js`** - Integration point for registration flow
4. **`webhooks.js`** - Optional webhook endpoints for status updates

### Email Template Features

- **Responsive Design**: Works on all devices
- **Role-Based Content**: Different messaging for coaches vs players
- **Brand Consistency**: Uses app colors and styling
- **Clear CTAs**: Action buttons for next steps
- **Professional Layout**: Clean HTML structure

### Non-Blocking Implementation

The email system uses `setImmediate()` to send emails asynchronously:

```javascript
setImmediate(async () => {
  try {
    await emailService.sendWelcomeEmail(user);
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError);
    // Registration continues successfully
  }
});
```

This ensures that:
- User registration completes immediately
- Email failures don't block the user experience
- System remains responsive under load

## Webhook Configuration (Optional)

For advanced email tracking, configure webhooks with your email provider:

### Postmark Webhooks
- URL: `https://yourdomain.com/api/webhooks/postmark`
- Events: Delivery, Bounce, Spam Complaint, Open, Click

### SendGrid Webhooks
- URL: `https://yourdomain.com/api/webhooks/sendgrid`
- Events: delivered, bounce, blocked, dropped, spamreport, open, click

### AWS SES Webhooks
- Configure SNS topic for bounce/complaint notifications
- URL: `https://yourdomain.com/api/webhooks/ses`

## Monitoring & Troubleshooting

### Database Queries for Monitoring

```sql
-- Check email sending status
SELECT 
  email_type,
  status,
  COUNT(*) as count
FROM email_events 
GROUP BY email_type, status;

-- Find failed emails
SELECT 
  ee.*,
  u.email as user_email,
  u.name as user_name
FROM email_events ee
JOIN users u ON ee.user_id = u.id
WHERE ee.status = 'failed'
ORDER BY ee.created_at DESC;

-- Check welcome email completion rate
SELECT 
  COUNT(CASE WHEN ee.status IN ('sent', 'delivered') THEN 1 END) as successful,
  COUNT(*) as total,
  ROUND(
    COUNT(CASE WHEN ee.status IN ('sent', 'delivered') THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as success_rate
FROM email_events ee
WHERE ee.email_type = 'welcome';
```

### Common Issues

1. **No emails being sent**
   - Check if environment variables are configured
   - Verify email service logs: "Email service disabled - no API keys configured"

2. **Emails marked as spam**
   - Verify sender domain authentication (SPF, DKIM, DMARC)
   - Check email content for spam triggers
   - Monitor spam complaint webhooks

3. **High bounce rates**
   - Validate email addresses before sending
   - Monitor bounce webhooks
   - Clean email lists regularly

## Testing

### Manual Testing
1. Register a new user account
2. Check server logs for email sending confirmation
3. Verify email receipt in inbox
4. Check `email_events` table for tracking data

### Development Mode
For development without actual email sending, simply don't configure any email provider environment variables. The system will log messages but not send emails.

## Security Considerations

- **API Keys**: Store securely in environment variables, never in code
- **Webhook Validation**: Consider adding webhook signature validation for production
- **Rate Limiting**: Monitor email sending rates to avoid provider limits
- **Data Privacy**: Email events contain user email addresses - handle according to privacy policies

## Future Enhancements

Potential improvements for the email system:

1. **Email Templates**
   - Template engine (Handlebars, Mustache)
   - Admin interface for template editing
   - A/B testing capabilities

2. **Advanced Features**
   - Email scheduling
   - Drip campaigns
   - Personalization beyond role
   - Unsubscribe management

3. **Analytics**
   - Email performance dashboard
   - Engagement metrics
   - Conversion tracking

4. **Reliability**
   - Queue system (Redis/Bull)
   - Retry logic with exponential backoff
   - Circuit breaker pattern

## Conclusion

The welcome email system provides a robust foundation for user engagement while maintaining system reliability and observability. The multi-provider approach ensures flexibility, while the comprehensive tracking enables data-driven improvements to email performance.
