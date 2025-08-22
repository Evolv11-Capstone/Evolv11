const express = require('express');
const router = express.Router();
const EmailEvent = require('../models/EmailEvent');

/**
 * Postmark webhook endpoint
 * Handles delivery, bounce, and spam complaint events
 */
router.post('/postmark', async (req, res) => {
  try {
    const { MessageID, Type, RecordType } = req.body;

    if (!MessageID) {
      return res.status(400).json({ error: 'MessageID required' });
    }

    // Find the email event by provider message ID
    const emailEvent = await EmailEvent.findByProviderMessageId(MessageID);
    if (!emailEvent) {
      console.log(`Email event not found for MessageID: ${MessageID}`);
      return res.status(404).json({ error: 'Email event not found' });
    }

    // Map Postmark event types to our status
    let status = 'sent';
    let errorMessage = null;

    switch (Type || RecordType) {
      case 'Delivery':
        status = 'delivered';
        break;
      case 'Bounce':
        status = 'bounced';
        errorMessage = req.body.Description || 'Email bounced';
        break;
      case 'SpamComplaint':
        status = 'spam_complaint';
        errorMessage = 'Marked as spam';
        break;
      case 'Open':
        status = 'opened';
        break;
      case 'Click':
        status = 'clicked';
        break;
    }

    // Update the email event
    await EmailEvent.update(emailEvent.id, { 
      status, 
      error_message: errorMessage 
    });

    console.log(`Updated email event ${emailEvent.id}: ${status}`);
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Postmark webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * SendGrid webhook endpoint
 * Handles various email events
 */
router.post('/sendgrid', async (req, res) => {
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];

    for (const event of events) {
      const { sg_message_id, event: eventType, reason } = event;

      if (!sg_message_id) continue;

      // Find the email event
      const emailEvent = await EmailEvent.findByProviderMessageId(sg_message_id);
      if (!emailEvent) {
        console.log(`Email event not found for SendGrid message: ${sg_message_id}`);
        continue;
      }

      // Map SendGrid event types
      let status = 'sent';
      let errorMessage = null;

      switch (eventType) {
        case 'delivered':
          status = 'delivered';
          break;
        case 'bounce':
        case 'blocked':
        case 'dropped':
          status = 'bounced';
          errorMessage = reason || 'Email bounced';
          break;
        case 'spamreport':
          status = 'spam_complaint';
          errorMessage = 'Marked as spam';
          break;
        case 'open':
          status = 'opened';
          break;
        case 'click':
          status = 'clicked';
          break;
      }

      // Update the email event
      await EmailEvent.update(emailEvent.id, { 
        status, 
        error_message: errorMessage 
      });

      console.log(`Updated email event ${emailEvent.id}: ${status}`);
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('SendGrid webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * AWS SES webhook endpoint (via SNS)
 * Handles SES bounce and complaint notifications
 */
router.post('/ses', async (req, res) => {
  try {
    const { Type, Message } = req.body;

    // Handle SNS subscription confirmation
    if (Type === 'SubscriptionConfirmation') {
      console.log('SNS subscription confirmation received');
      return res.status(200).json({ success: true });
    }

    if (Type !== 'Notification' || !Message) {
      return res.status(400).json({ error: 'Invalid SNS notification' });
    }

    const message = JSON.parse(Message);
    const { notificationType, mail } = message;

    if (!mail?.messageId) {
      return res.status(400).json({ error: 'Message ID required' });
    }

    // Find the email event
    const emailEvent = await EmailEvent.findByProviderMessageId(mail.messageId);
    if (!emailEvent) {
      console.log(`Email event not found for SES message: ${mail.messageId}`);
      return res.status(404).json({ error: 'Email event not found' });
    }

    // Map SES notification types
    let status = 'sent';
    let errorMessage = null;

    switch (notificationType) {
      case 'Delivery':
        status = 'delivered';
        break;
      case 'Bounce':
        status = 'bounced';
        errorMessage = message.bounce?.bouncedRecipients?.[0]?.diagnosticCode || 'Email bounced';
        break;
      case 'Complaint':
        status = 'spam_complaint';
        errorMessage = 'Spam complaint received';
        break;
    }

    // Update the email event
    await EmailEvent.update(emailEvent.id, { 
      status, 
      error_message: errorMessage 
    });

    console.log(`Updated email event ${emailEvent.id}: ${status}`);
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('AWS SES webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
