import { checkAdminAuth } from './auth-middleware';
import { EmailTypes } from '@/lib/emailTypes';

export default async function handler(req, res) {
  // Check auth
  const authResult = await checkAdminAuth(req, res);
  if (!authResult.isAuthorized) {
    return res.status(authResult.statusCode).json({ message: authResult.message });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Return all available email templates with descriptions
    const templates = [
      {
        id: EmailTypes.USER_WELCOME,
        name: "User Welcome",
        description: "Sent to users when they first sign up"
      },
      {
        id: EmailTypes.BID_CREATED,
        name: "Bid Created",
        description: "Sent to users when they create a new bid"
      },
      {
        id: EmailTypes.BID_APPROVED,
        name: "Bid Approved",
        description: "Sent to users when their bid is approved"
      },
      {
        id: EmailTypes.BID_REJECTED,
        name: "Bid Rejected",
        description: "Sent to users when their bid is rejected"
      },
      {
        id: EmailTypes.PASSWORD_RESET,
        name: "Password Reset",
        description: "Sent to users when they request a password reset"
      },
      {
        id: EmailTypes.DJ_APPLICATION_RECEIVED,
        name: "DJ Application Received",
        description: "Sent to users when they submit a DJ application"
      },
      {
        id: EmailTypes.DJ_APPLICATION_APPROVED,
        name: "DJ Application Approved",
        description: "Sent to users when their DJ application is approved"
      },
      {
        id: EmailTypes.DJ_APPLICATION_REJECTED,
        name: "DJ Application Rejected",
        description: "Sent to users when their DJ application is rejected"
      }
    ];
    
    return res.status(200).json({ templates });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return res.status(500).json({ message: 'Failed to fetch email templates', error: error.message });
  }
} 