import { checkAdminAuth } from './auth-middleware';
import { sendNotificationEmail } from "@/lib/email";

export default async function handler(req, res) {
  // Check auth
  const authResult = await checkAdminAuth(req, res);
  if (!authResult.isAuthorized) {
    return res.status(authResult.statusCode).json({ message: authResult.message });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { to, template, customData } = req.body;
    
    if (!to || !template) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Send test email
    const result = await sendNotificationEmail(template, to, customData);
    
    if (result.success) {
      // Log the email in the database
      // This would be implemented in a production environment
      
      return res.status(200).json({ message: 'Test email sent successfully' });
    } else {
      return res.status(500).json({ message: 'Failed to send test email', error: result.error });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({ message: 'Failed to send test email', error: error.message });
  }
} 