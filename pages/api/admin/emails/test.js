import { checkAdminAuth } from './auth-middleware';
import { sendNotificationEmail } from "@/lib/email";

export default async function handler(req, res) {
  // Check auth
  const authResult = await checkAdminAuth(req, res);
  if (!authResult.isAuthorized) {
    return res.status(authResult.statusCode).json({ message: authResult.message });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, type, data } = req.body;
    
    console.log("API received:", { to, type, data });
    
    if (!to || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Call sendNotificationEmail with the correct structure
    const result = await sendNotificationEmail({ 
      to, 
      type, 
      data
    });
    
    if (result && result.success) {
      // Log the email in the database
      // This would be implemented in a production environment
      
      return res.status(200).json({ 
        success: true, 
        message: 'Test email sent successfully' 
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to send email', 
        details: result?.error || 'Unknown error' 
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({ 
      error: 'Failed to send test email', 
      details: error.message 
    });
  }
} 