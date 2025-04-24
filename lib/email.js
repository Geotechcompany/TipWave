"use server";

import nodemailer from 'nodemailer';

// Use only SMTP for email sending
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'smtp';

// Initialize SMTP transport
let smtpTransport = null;
if (EMAIL_PROVIDER === 'smtp') {
  // Add debug logging for SMTP configuration
  console.log('Configuring SMTP with host:', process.env.SMTP_HOST);
  console.log('SMTP User:', process.env.SMTP_USER); 
  
  smtpTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    debug: true, // Add this for detailed debugging
    logger: true, // Add this for detailed logging
    tls: {
      rejectUnauthorized: false
    }
  });
  
  // Verify SMTP connection on startup
  smtpTransport.verify(function(error, success) {
    if (error) {
      console.error('SMTP connection error:', error);
    } else {
      console.log("SMTP server connection verified and ready to send emails:", success);
    }
  });
}

// Define email types
export const EmailTypes = {
  USER_WELCOME: 'user_welcome',
  BID_CREATED: 'bid_created',
  BID_APPROVED: 'bid_approved',
  BID_REJECTED: 'bid_rejected',
  DJ_APPLICATION_APPROVED: 'dj_application_approved',
  DJ_APPLICATION_REJECTED: 'dj_application_rejected',
  PASSWORD_RESET: 'password_reset',
  DJ_APPLICATION_RECEIVED: 'dj_application_received',
};

/**
 * Get email template content based on type and data
 * @param {string} type - Email template type
 * @param {Object} data - Data to be used in template
 * @returns {Object} - Email subject, text and html content
 */
function getEmailTemplate(type, data = {}) {
  const templates = {
    [EmailTypes.USER_WELCOME]: {
      subject: 'Welcome to SongBid!',
      text: `Hello ${data.userName || 'there'},\n\nWelcome to SongBid! We're excited to have you join our community.\n\nBest Regards,\nThe SongBid Team`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #3b82f6;">Welcome to SongBid!</h2>
               <p>Hello ${data.userName || 'there'},</p>
               <p>Welcome to SongBid! We're excited to have you join our community.</p>
               <p>Best Regards,<br>The SongBid Team</p>
             </div>`
    },
    [EmailTypes.BID_CREATED]: {
      subject: 'Your Bid Has Been Submitted',
      text: `Hello ${data.userName || 'there'},\n\nYour bid for ${data.songTitle || 'the song'} has been submitted successfully for ${data.amount || '$0'}.\n\nBest Regards,\nThe SongBid Team`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #3b82f6;">Bid Submitted Successfully</h2>
               <p>Hello ${data.userName || 'there'},</p>
               <p>Your bid for "${data.songTitle || 'the song'}" has been submitted successfully for ${data.amount || '$0'}.</p>
               <p>Best Regards,<br>The SongBid Team</p>
             </div>`
    },
    [EmailTypes.BID_APPROVED]: {
      subject: 'Your Bid Has Been Approved',
      text: `Hello ${data.userName || 'there'},\n\nGreat news! Your bid for ${data.songTitle || 'the song'} has been approved.\n\nBest Regards,\nThe SongBid Team`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #22c55e;">Bid Approved!</h2>
               <p>Hello ${data.userName || 'there'},</p>
               <p>Great news! Your bid for "${data.songTitle || 'the song'}" has been approved.</p>
               <p>Best Regards,<br>The SongBid Team</p>
             </div>`
    },
    [EmailTypes.BID_REJECTED]: {
      subject: 'Your Bid Status Update',
      text: `Hello ${data.userName || 'there'},\n\nWe're sorry to inform you that your bid for ${data.songTitle || 'the song'} has been rejected.\n\nBest Regards,\nThe SongBid Team`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #ef4444;">Bid Status Update</h2>
               <p>Hello ${data.userName || 'there'},</p>
               <p>We're sorry to inform you that your bid for "${data.songTitle || 'the song'}" has been rejected.</p>
               <p>Best Regards,<br>The SongBid Team</p>
             </div>`
    },
    [EmailTypes.DJ_APPLICATION_APPROVED]: {
      subject: 'Your DJ Application Has Been Approved',
      text: `Hello ${data.userName || 'there'},\n\nCongratulations! Your DJ application has been approved. You can now start accepting bids.\n\nBest Regards,\nThe SongBid Team`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #22c55e;">DJ Application Approved!</h2>
               <p>Hello ${data.userName || 'there'},</p>
               <p>Congratulations! Your DJ application has been approved. You can now start accepting bids.</p>
               <p>Best Regards,<br>The SongBid Team</p>
             </div>`
    },
    [EmailTypes.DJ_APPLICATION_REJECTED]: {
      subject: 'Your DJ Application Status',
      text: `Hello ${data.userName || 'there'},\n\nWe've reviewed your DJ application and unfortunately, we cannot approve it at this time.\n\nBest Regards,\nThe SongBid Team`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #ef4444;">DJ Application Status</h2>
               <p>Hello ${data.userName || 'there'},</p>
               <p>We've reviewed your DJ application and unfortunately, we cannot approve it at this time.</p>
               <p>Best Regards,<br>The SongBid Team</p>
             </div>`
    },
    [EmailTypes.PASSWORD_RESET]: {
      subject: 'Password Reset Request',
      text: `Hello ${data.userName || 'there'},\n\nYou requested a password reset. Please click the link below to reset your password:\n\n${data.resetUrl || 'https://example.com/reset-password'}\n\nIf you didn't request this, please ignore this email.\n\nBest Regards,\nThe SongBid Team`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #3b82f6;">Password Reset Request</h2>
               <p>Hello ${data.userName || 'there'},</p>
               <p>You requested a password reset. Please click the button below to reset your password:</p>
               <div style="text-align: center; margin: 20px 0;">
                 <a href="${data.resetUrl || 'https://example.com/reset-password'}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
               </div>
               <p>If you didn't request this, please ignore this email.</p>
               <p>Best Regards,<br>The SongBid Team</p>
             </div>`
    },
    [EmailTypes.DJ_APPLICATION_RECEIVED]: {
      subject: 'Your DJ Application Has Been Received',
      text: `Hello ${data.userName || 'there'},\n\nWe've received your application to become a DJ on SongBid. We'll review it shortly and get back to you.\n\nBest Regards,\nThe SongBid Team`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #3b82f6;">DJ Application Received</h2>
               <p>Hello ${data.userName || 'there'},</p>
               <p>We've received your application to become a DJ on SongBid.</p>
               <p>We'll review your application shortly and get back to you.</p>
               <p>Best Regards,<br>The SongBid Team</p>
             </div>`
    }
  };
  
  return templates[type] || {
    subject: 'Notification from SongBid',
    text: `Hello ${data.userName || 'there'},\n\nThis is a notification from SongBid.\n\nBest Regards,\nThe SongBid Team`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
             <h2 style="color: #3b82f6;">Notification</h2>
             <p>Hello ${data.userName || 'there'},</p>
             <p>This is a notification from SongBid.</p>
             <p>Best Regards,<br>The SongBid Team</p>
           </div>`
  };
}

/**
 * Send an email using SMTP
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @param {string} options.from - Sender email (optional, uses default if not provided)
 * @returns {Promise} - Resolution/rejection of send operation
 */
export async function sendEmail({ to, subject, text, html, from }) {
  const sender = from || process.env.EMAIL_FROM || 'noreply@songbid.com';
  
  try {
    if (!smtpTransport) {
      throw new Error('SMTP is not configured properly. Check your environment variables.');
    }
    
    const info = await smtpTransport.sendMail({
      from: sender,
      to,
      subject,
      text,
      html
    });
    
    console.log(`Email sent to ${to} via SMTP: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send notification email based on template type
 * @param {string} type - Email template type
 * @param {string} to - Recipient email
 * @param {Object} data - Data to be used in template
 * @returns {Promise} - Resolution/rejection of send operation
 */
export async function sendNotificationEmail(type, to, data = {}) {
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
  return sendNotificationEmail(EmailTypes.PASSWORD_RESET, to, {
    userName: name,
    resetUrl
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