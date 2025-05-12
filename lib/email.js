"use server";

import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import clientPromise from '@/lib/mongodb';

// Get both SMTP and Resend settings from database
async function getEmailSettings() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const smtpSettings = await db.collection('smtp_settings').findOne({ type: 'smtp_config' });
    const resendSettings = await db.collection('resend_settings').findOne({ type: 'resend_config' });
    
    return {
      smtp: smtpSettings,
      resend: resendSettings
    };
  } catch (error) {
    console.error('Error fetching email settings:', error);
    return { smtp: null, resend: null };
  }
}

// Initialize email transport based on settings
async function initializeEmailTransport() {
  const settings = await getEmailSettings();
  
  // Check if SMTP is enabled and configured
  if (settings.smtp?.isEnabled) {
    console.log('Configuring SMTP transport with host:', settings.smtp.host);
    
    const transport = nodemailer.createTransport({
      host: settings.smtp.host,
      port: parseInt(settings.smtp.port),
      secure: settings.smtp.secure,
      auth: {
        user: settings.smtp.user,
        pass: settings.smtp.password,
      },
      debug: true,
      logger: true,
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      pool: true,
      maxConnections: 1,
      maxMessages: 1,
      socketTimeout: 60000,
      connectionTimeout: 60000,
    });
    
    try {
      await transport.verify();
      console.log("SMTP server connection verified");
      return { type: 'smtp', transport, settings: settings.smtp };
    } catch (error) {
      console.error('SMTP connection error:', error);
    }
  }
  
  // Fallback to Resend if enabled
  if (settings.resend?.isEnabled) {
    console.log('Using Resend transport');
    const resend = new Resend(settings.resend.apiKey);
    return { type: 'resend', transport: resend, settings: settings.resend };
  }
  
  console.error('No email provider is enabled');
  return null;
}

// Helper function to get payment status styling
const getPaymentStatusConfig = (status) => {
  const statusStr = (status || 'pending').toString().toLowerCase();
  
  const configs = {
    pending: {
      text: 'Pending',
      color: '#FFC107'
    },
    completed: {
      text: 'Completed',
      color: '#4CAF50'
    },
    failed: {
      text: 'Failed',
      color: '#F44336'
    },
    cancelled: {
      text: 'Cancelled',
      color: '#9E9E9E'
    },
    default: {
      text: 'Processing',
      color: '#2196F3'
    }
  };

  return configs[statusStr] || configs.default;
};

// Email template functions
export const EmailTemplates = {
  welcome: ({ name }) => ({
    subject: 'Welcome to TipWave! 🎵',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to TipWave, ${name || 'there'}!</h1>
        <p>Thank you for joining our community. We're excited to have you on board!</p>
        <p>With TipWave, you can:</p>
        <ul>
          <li>Request your favorite songs at events</li>
          <li>Support your favorite DJs</li>
          <li>Discover new music and events</li>
        </ul>
        <p>Get started by exploring upcoming events or creating your first song request.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/user" 
           style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">
          Go to Dashboard
        </a>
      </div>
    `
  }),

  bidConfirmation: ({ userName, songTitle, songArtist, amount, estimatedPlayTime }) => ({
    subject: 'Song Request Confirmed! 🎵',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Bid Confirmation</h1>
        <p>Hi ${userName},</p>
        <p>Your bid for "${songTitle}" by ${songArtist || 'Unknown Artist'} has been received!</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Bid amount:</strong> $${amount}</p>
          ${estimatedPlayTime ? `<p style="margin: 5px 0;"><strong>Estimated play time:</strong> ${estimatedPlayTime}</p>` : ''}
          <p style="margin: 5px 0;"><strong>Status:</strong> Confirmed</p>
        </div>
        <p>Thank you for using TipWave!</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/user/requests" 
           style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">
          View Your Requests
        </a>
      </div>
    `
  }),

  paymentStatus: (data) => {
    const statusConfig = getPaymentStatusConfig(data.status);
    return {
      subject: `Payment ${data.status} - TipWave`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Payment Status Update</h1>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Amount:</strong> $${data.amount}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> 
              <span style="color: ${statusConfig.color};">${statusConfig.text}</span>
            </p>
            <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${data.transactionId}</p>
            ${data.paymentMethod ? `<p style="margin: 5px 0;"><strong>Payment Method:</strong> ${data.paymentMethod}</p>` : ''}
          </div>
        </div>
      `
    };
  }
};

// Export email types
export const EmailTypes = {
  USER_WELCOME: 'welcome',
  BID_CREATED: 'bid_created',
  BID_CONFIRMATION: 'bidConfirmation',
  PAYMENT_STATUS: 'paymentStatus',
  // ... other email types
};

// Update sendEmail function to use templates
export async function sendEmail({ to, template, data }) {
  if (!to) {
    console.error('No recipient email address provided');
    return { success: false, error: 'Recipient email is required' };
  }

  try {
    const emailProvider = await initializeEmailTransport();
    if (!emailProvider) {
      throw new Error('No email provider is configured');
    }

    // Get template content
    const templateFunction = EmailTemplates[template];
    if (!templateFunction) {
      throw new Error(`Email template '${template}' not found`);
    }

    const { subject, html } = templateFunction(data);
    const text = html.replace(/<[^>]*>/g, ''); // Strip HTML for text version

    let result;
    const client = await clientPromise;
    const db = client.db();

    if (emailProvider.type === 'smtp') {
      const mailOptions = {
        from: emailProvider.settings.from,
        to,
        subject,
        text,
        html
      };

      result = await emailProvider.transport.sendMail(mailOptions);
      console.log('Email sent successfully via SMTP:', result);
    } else {
      // Using Resend
      result = await emailProvider.transport.emails.send({
        from: emailProvider.settings.fromEmail,
        to,
        subject,
        text,
        html
      });
      console.log('Email sent successfully via Resend:', result);
    }

    // Log the successful email
    await db.collection('email_logs').insertOne({
      type: template,
      provider: emailProvider.type,
      recipient: to,
      subject,
      status: 'sent',
      messageId: result?.messageId || result?.id,
      sentAt: new Date(),
      response: JSON.stringify(result)
    });

    return { 
      success: true, 
      messageId: result?.messageId || result?.id 
    };

  } catch (error) {
    console.error('Error sending email:', error);
    
    // Log the failed attempt
    try {
      const client = await clientPromise;
      const db = client.db();
      await db.collection('email_logs').insertOne({
        type: template,
        recipient: to,
        subject: template, // Store template name as subject for failed attempts
        status: 'failed',
        error: error.message,
        sentAt: new Date()
      });
    } catch (logError) {
      console.error('Error logging failed email:', logError);
    }

    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Send a notification email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.type - Email type from EmailTypes
 * @param {Object} options.data - Data to be used in template
 * @returns {Promise} - Resolution/rejection of send operation
 */
export const sendNotificationEmail = async ({ to, type, data = {} }) => {
  if (!to || !isValidEmail(to)) {
    console.error('Invalid recipient email:', to);
    return { success: false, error: 'Invalid recipient email' };
  }

  if (!type) {
    console.error('No email type specified');
    return { success: false, error: 'Email type is required' };
  }

  const template = getEmailTemplate(type, data);
  return sendEmail({
    to,
    subject: template.subject,
    text: template.text,
    html: template.html
  });
}

/**
 * Send a password reset email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.resetUrl - Password reset URL
 * @param {string} options.name - User's name
 * @returns {Promise} - Resolution/rejection of send operation
 */
export async function sendResetEmail({ to, resetUrl, name }) {
  return sendNotificationEmail({
    to,
    type: EmailTypes.PASSWORD_RESET,
    data: {
      userName: name,
      resetUrl
    }
  });
}

// Fix the sendTestEmail function
export const sendTestEmail = async function(to) {
  try {
    const result = await sendEmail({
      to,
      subject: "Test Email from TipWave",
      text: "This is a test email from TipWave.",
      html: "<p>This is a test email from TipWave.</p>"
    });
    
    console.log("Test email sent successfully:", result);
    return { success: true };
  } catch (error) {
    console.error("Error sending test email:", error);
    return { success: false, error: error.message };
  }
}

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}