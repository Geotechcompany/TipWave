import { checkAdminAuth } from './auth-middleware';
import clientPromise from '@/lib/mongodb';

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
    const client = await clientPromise;
    const db = client.db();
    
    // In a real implementation, you would have an email_logs collection
    // For demo purposes, we'll return mock data
    const mockLogs = [
      {
        id: '1',
        recipient: 'user@example.com',
        subject: 'Welcome to SongBid!',
        template: 'user_welcome',
        status: 'sent',
        sentAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '2',
        recipient: 'dj@example.com',
        subject: 'Your DJ Application Has Been Approved',
        template: 'dj_application_approved',
        status: 'sent',
        sentAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: '3',
        recipient: 'failed@example.com',
        subject: 'Bid Approved',
        template: 'bid_approved',
        status: 'failed',
        sentAt: new Date(Date.now() - 10800000).toISOString(),
      }
    ];
    
    return res.status(200).json({ logs: mockLogs });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    return res.status(500).json({ message: 'Failed to fetch email logs', error: error.message });
  }
} 