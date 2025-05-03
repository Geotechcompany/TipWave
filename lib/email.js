"use server";

import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Use only SMTP for email sending
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'smtp';

// Initialize SMTP transport
let smtpTransport = null;
if (EMAIL_PROVIDER === 'smtp') {
  // Add debug logging for SMTP configuration
  console.log('Configuring SMTP with host:', process.env.SMTP_HOST);
  
  smtpTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || 'arthurbreck417@gmail.com',
      pass: process.env.SMTP_PASSWORD || 'ubop lomz rnfe ulca',
    },
    debug: true, // For detailed debugging
    logger: true, // For detailed logging
    tls: {
      rejectUnauthorized: false // Less strict about certificates
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

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

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
  WELCOME: 'WELCOME',
  BID_CONFIRMATION: 'BID_CONFIRMATION',
  FRIEND_INVITATION: 'FRIEND_INVITATION',
  WALLET_TOPUP: 'wallet-topup',
  SONG_REQUEST: 'song-request',
  SONG_REQUEST_ACCEPTED: 'song-request-accepted',
  SONG_REQUEST_REJECTED: 'song-request-rejected',
  PAYMENT_STATUS: 'payment_status',
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
    },
    [EmailTypes.WELCOME]: {
      subject: 'Welcome to TipWave!',
      text: `Hello ${data.name || 'there'},\n\nWelcome to TipWave! We're excited to have you on board!\n\nBest Regards,\nThe TipWave Team`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h1>Welcome to TipWave, ${data.name || 'there'}!</h1>
               <p>Thank you for joining our community. We're excited to have you on board!</p>
               <p>With TipWave, you can:</p>
               <ul>
                 <li>Request your favorite songs at events</li>
                 <li>Support your favorite DJs</li>
                 <li>Discover new music and events</li>
               </ul>
               <p>Get started by exploring upcoming events or creating your first song request.</p>
               <a href="${process.env.NEXTAUTH_URL}/dashboard/user" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Go to Dashboard</a>
             </div>`
    },
    [EmailTypes.BID_CONFIRMATION]: {
      subject: 'Your Bid Confirmation',
      text: `Hello ${data.userName || 'there'},\n\nYour bid for "${data.songTitle}" by ${data.songArtist} has been received!\n\nBest Regards,\nThe TipWave Team`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h1>Bid Confirmation</h1>
               <p>Your bid for "${data.songTitle}" by ${data.songArtist} has been received!</p>
               <p>Bid amount: $${data.amount}</p>
               <p>Status: ${data.status}</p>
               <p>Thank you for using TipWave!</p>
               <a href="${process.env.NEXTAUTH_URL}/dashboard/user/requests" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">View Your Requests</a>
             </div>`
    },
    [EmailTypes.FRIEND_INVITATION]: {
      subject: 'You Have Been Invited to Join TipWave',
      text: `Hello ${data.userName || 'there'},\n\nYou have been invited to join TipWave. Please click the link below to accept the invitation:\n\n${data.invitationUrl || 'https://example.com/accept-invitation'}\n\nIf you don't want to join, please ignore this email.\n\nBest Regards,\nThe TipWave Team`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #3b82f6;">You Have Been Invited to Join TipWave</h2>
               <p>Hello ${data.userName || 'there'},</p>
               <p>You have been invited to join TipWave. Please click the button below to accept the invitation:</p>
               <div style="text-align: center; margin: 20px 0;">
                 <a href="${data.invitationUrl || 'https://example.com/accept-invitation'}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Accept Invitation</a>
               </div>
               <p>If you don't want to join, please ignore this email.</p>
               <p>Best Regards,<br>The TipWave Team</p>
             </div>`
    },
    [EmailTypes.WALLET_TOPUP]: {
      subject: 'Your TipWave Wallet Top-Up Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4f46e5;">TipWave Wallet Top-Up Confirmation</h2>
          <p>Hello ${data.userName},</p>
          <p>Your wallet has been successfully topped up!</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Amount:</strong> ${data.currency} ${data.amount}</p>
            <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
          </div>
          <p>Your TipWave wallet balance has been updated. You can now use your funds to send song requests to DJs.</p>
          <p>Thank you for using TipWave!</p>
          <p>- The TipWave Team</p>
        </div>
      `,
    },
    [EmailTypes.SONG_REQUEST]: {
      subject: 'Song Request Received',
      text: `Hello ${data.userName || 'there'},\n\nWe've received your song request for "${data.songTitle}" by ${data.songArtist}.\n\nBest Regards,\nThe SongBid Team`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #3b82f6;">Song Request Received</h2>
               <p>Hello ${data.userName || 'there'},</p>
               <p>We've received your song request for "${data.songTitle}" by ${data.songArtist}.</p>
               <p>Best Regards,<br>The SongBid Team</p>
             </div>`
    },
    [EmailTypes.SONG_REQUEST_ACCEPTED]: {
      subject: 'Song Request Accepted',
      text: `Hello ${data.userName || 'there'},\n\nGreat news! Your song request for "${data.songTitle}" by ${data.songArtist} has been accepted.\n\nBest Regards,\nThe SongBid Team`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #22c55e;">Song Request Accepted</h2>
               <p>Hello ${data.userName || 'there'},</p>
               <p>Great news! Your song request for "${data.songTitle}" by ${data.songArtist} has been accepted.</p>
               <p>Best Regards,<br>The SongBid Team</p>
             </div>`
    },
    [EmailTypes.SONG_REQUEST_REJECTED]: {
      subject: 'Song Request Rejected',
      text: `Hello ${data.userName || 'there'},\n\nWe're sorry to inform you that your song request for "${data.songTitle}" by ${data.songArtist} has been rejected.\n\nBest Regards,\nThe SongBid Team`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #ef4444;">Song Request Rejected</h2>
               <p>Hello ${data.userName || 'there'},</p>
               <p>We're sorry to inform you that your song request for "${data.songTitle}" by ${data.songArtist} has been rejected.</p>
               <p>Best Regards,<br>The SongBid Team</p>
             </div>`
    },
    [EmailTypes.PAYMENT_STATUS]: {
      subject: data.status === 'COMPLETED' ? 'Payment Successful - TipWave' : 'Payment Status Update - TipWave',
      html: getPaymentStatusTemplate(data)
    },
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
 * Send an email using Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content
 * @returns {Promise} - Email send result
 */
export async function sendEmail({ to, subject, html, text }) {
  console.log(`Attempting to send email to ${to} with subject: ${subject}`);
  
  try {
    if (EMAIL_PROVIDER === 'smtp') {
      console.log('Using SMTP transport for email delivery');
      
      if (!smtpTransport) {
        console.error('SMTP transport not initialized!');
        throw new Error('SMTP transport not initialized');
      }
      
      const result = await smtpTransport.sendMail({
        from: process.env.SMTP_FROM || 'arthurbreck417@gmail.com',
        to,
        subject,
        html,
        text,
      });
      
      console.log('Email sent successfully via SMTP:', result.messageId);
      return result;
    } else if (EMAIL_PROVIDER === 'resend') {
      console.log('Using Resend for email delivery');
      const result = await resend.emails.send({
        from: 'TipWave <no-reply@tipwave.app>',
        to,
        subject,
        html,
        text,
      });
      
      console.log('Email sent successfully via Resend:', result.id);
      return result;
    } else {
      throw new Error(`Unknown email provider: ${EMAIL_PROVIDER}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
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
  try {
    // Get the email template based on type and data
    let template;
    
    // Use the appropriate template based on the email type
    switch(type) {
      case EmailTypes.WELCOME:
      case EmailTypes.USER_WELCOME:
        template = {
          subject: 'Welcome to TipWave!',
          text: `Welcome to TipWave, ${data.userName || 'User'}!`,
          html: getWelcomeEmailTemplate(data)
        };
        break;
      case EmailTypes.BID_CONFIRMATION:
      case EmailTypes.BID_CREATED:
        template = {
          subject: 'Your Bid Confirmation',
          text: `Your bid for "${data.songTitle}" has been received!`,
          html: getBidConfirmationTemplate(data)
        };
        break;
      case EmailTypes.WALLET_TOPUP:
        template = getEmailTemplate(type, data);
        break;
      default:
        // For other types, use the getEmailTemplate function
        template = getEmailTemplate(type, data);
    }
    
    // Send the email using the sendEmail function
    const result = await sendEmail({
      to,
      subject: template.subject,
      text: template.text,
      html: template.html
    });
    
    console.log(`Notification email of type ${type} sent to ${to}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`Error sending ${type} notification email:`, error);
    return { success: false, error: error.message };
  }
};

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

// Remove orphaned commented code and empty space

// Add this function at the end of the file
const getPaymentStatusTemplate = (data) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1>${data.status === 'COMPLETED' ? 'Payment Successful' : 'Payment Status Update'}</h1>
    <p>Your M-Pesa payment of ${data.currency} ${data.amount} is ${data.status.toLowerCase()}.</p>
    
    ${data.status === 'COMPLETED' 
      ? `<p>Transaction reference: ${data.transactionId || 'N/A'}</p>
         <p>Your wallet has been updated. New balance: ${data.currency} ${data.balance || 'updated'}</p>`
      : `<p>We'll notify you when the payment is completed.</p>
         <p>If you have questions, please contact our support team.</p>`
    }
    
    <p>Date: ${data.date}</p>
    
    <a href="${process.env.NEXTAUTH_URL}/dashboard/user/wallet" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">View Your Wallet</a>
  </div>
`;

// Also add these missing template functions
const getWelcomeEmailTemplate = (data) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1>Welcome to TipWave, ${data.name || data.userName || 'there'}!</h1>
    <p>Thank you for joining our community. We're excited to have you on board!</p>
    <p>With TipWave, you can:</p>
    <ul>
      <li>Request your favorite songs at events</li>
      <li>Support your favorite DJs</li>
      <li>Discover new music and events</li>
    </ul>
    <p>Get started by exploring upcoming events or creating your first song request.</p>
    <a href="${process.env.NEXTAUTH_URL}/dashboard/user" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Go to Dashboard</a>
  </div>
`;

const getBidConfirmationTemplate = (data) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1>Bid Confirmation</h1>
    <p>Your bid for "${data.songTitle}" by ${data.songArtist || 'Unknown Artist'} has been received!</p>
    <p>Bid amount: $${data.amount}</p>
    <p>Status: ${data.status || 'Pending'}</p>
    <p>Thank you for using TipWave!</p>
    <a href="${process.env.NEXTAUTH_URL}/dashboard/user/requests" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">View Your Requests</a>
  </div>
`;