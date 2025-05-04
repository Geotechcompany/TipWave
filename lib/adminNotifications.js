import nodemailer from 'nodemailer';
import clientPromise from './mongodb';

/**
 * Sends an email notification to all admin users
 * 
 * @param {Object} options - Notification options
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email HTML content
 * @param {Object} options.data - Additional data to include in template
 */
export async function notifyAdmins({ subject, message, data = {} }) {
  try {
    // Get MongoDB client
    const client = await clientPromise;
    const db = client.db();
    
    // Fetch admin users from the database
    const adminUsers = await db.collection('users').find({ role: 'ADMIN' }).toArray();
    
    if (!adminUsers || adminUsers.length === 0) {
      console.warn('No admin users found to notify');
      return;
    }

    // Get email configuration from environment variables
    const emailConfig = {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      secure: true,
    };

    const transporter = nodemailer.createTransport(emailConfig);
    
    // Send email to each admin
    const emailPromises = adminUsers.map(admin => {
      if (!admin.email) return null;
      
      return transporter.sendMail({
        from: `"TipWave Admin" <${process.env.EMAIL_FROM}>`,
        to: admin.email,
        subject,
        html: message.replace('{{name}}', admin.name || 'Admin')
                    .replace('{{data}}', JSON.stringify(data, null, 2)),
      });
    }).filter(Boolean);
    
    await Promise.all(emailPromises);
    
    console.log(`Sent admin notifications to ${emailPromises.length} admins`);
    return true;
  } catch (error) {
    console.error('Failed to send admin notifications:', error);
    // Don't throw - this is a notification and shouldn't break the main flow
    return false;
  }
}

/**
 * Notify admins about a new user registration
 * 
 * @param {Object} user - The newly registered user
 */
export async function notifyAdminsOfNewUser(user) {
  const { name, email, role } = user;
  
  const subject = `New User Registration: ${name}`;
  
  const message = `
    <h2>New User Registration</h2>
    <p>Hello {{name}},</p>
    <p>A new user has registered on TipWave:</p>
    <table style="border-collapse: collapse; width: 100%;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${name || 'Not provided'}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${email || 'Not provided'}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Role</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${role || 'USER'}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Time</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td>
      </tr>
    </table>
    <p>You can view the full user details in the <a href="${process.env.NEXTAUTH_URL}/dashboard/admin">admin dashboard</a>.</p>
    <p>Best regards,<br>TipWave Notifications</p>
  `;
  
  return notifyAdmins({ 
    subject, 
    message,
    data: { user: { name, email, role, registeredAt: new Date() } }
  });
} 