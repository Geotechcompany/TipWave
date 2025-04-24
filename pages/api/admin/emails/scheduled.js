import { checkAdminAuth } from './auth-middleware';
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  // Check auth
  const authResult = await checkAdminAuth(req, res);
  if (!authResult.isAuthorized) {
    return res.status(authResult.statusCode).json({ message: authResult.message });
  }

  if (req.method === 'GET') {
    try {
      // In a real implementation, you would fetch from a database
      // For demo purposes, we'll return mock data
      const mockScheduledEmails = [
        {
          id: '1',
          templateName: 'User Welcome',
          template: 'user_welcome',
          recipientType: 'All Users',
          scheduledTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
          status: 'pending',
          recipientCount: 120,
        },
        {
          id: '2',
          templateName: 'Inactive User Reminder',
          template: 'inactive_reminder',
          recipientType: 'Inactive Users',
          scheduledTime: new Date(Date.now() + 172800000).toISOString(), // in 2 days
          status: 'pending',
          recipientCount: 45,
        }
      ];
      
      return res.status(200).json({ emails: mockScheduledEmails });
    } catch (error) {
      console.error('Error fetching scheduled emails:', error);
      return res.status(500).json({ message: 'Failed to fetch scheduled emails', error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { template, recipientType, scheduledDate, scheduledTime } = req.body;
      
      if (!template || !recipientType || !scheduledDate || !scheduledTime) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // In a real implementation, save to database and schedule with a task queue
      
      return res.status(200).json({ message: 'Email scheduled successfully' });
    } catch (error) {
      console.error('Error scheduling email:', error);
      return res.status(500).json({ message: 'Failed to schedule email', error: error.message });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
} 