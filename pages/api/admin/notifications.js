import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getCollection } from '../../../lib/db';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }

  if (req.method === 'GET') {
    try {
      const notifications = await getCollection('notifications');
      
      // Get recent notifications with proper sorting and limit
      const recentNotifications = await notifications
        .find({ 
          // Add any relevant filters here
          // For example: status: 'unread'
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();

      res.status(200).json({
        notifications: recentNotifications.map(notification => ({
          _id: notification._id,
          type: notification.type,
          message: notification.message,
          createdAt: notification.createdAt,
          status: notification.status,
          // Add any other relevant fields
          metadata: notification.metadata
        }))
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 