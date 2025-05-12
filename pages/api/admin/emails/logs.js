import { checkAdminAuth } from './auth-middleware';
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  // Check auth
  const authResult = await checkAdminAuth(req, res);
  if (!authResult.isAuthorized) {
    return res.status(authResult.statusCode).json({ message: authResult.message });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Get all logs sorted by date
    const logs = await db.collection('email_logs')
      .find({})
      .sort({ sentAt: -1 })
      .toArray();

    // Get scheduled emails count
    const scheduledCount = await db.collection('scheduled_emails')
      .countDocuments({}) || 0;

    // Calculate counts
    const counts = {
      sent: logs.filter(log => log.status === 'sent').length || 0,
      failed: logs.filter(log => log.status === 'failed').length || 0,
      scheduled: scheduledCount
    };

    console.log('Email stats:', counts); // Add this for debugging

    return res.status(200).json({
      logs,
      counts,
      success: true
    });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch email logs',
      details: error.message 
    });
  }
} 