import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const client = await clientPromise;
  const db = client.db();

  if (req.method === 'GET') {
    try {
      const notifications = await db.collection('notifications')
        .find({ 
          djId: session.user.id,
          read: { $ne: true } 
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();

      const unreadCount = await db.collection('notifications')
        .countDocuments({ 
          djId: session.user.id, 
          read: { $ne: true } 
        });

      res.status(200).json({ notifications, unreadCount });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  } else if (req.method === 'PATCH') {
    try {
      await db.collection('notifications').updateMany(
        { djId: session.user.id },
        { $set: { read: true, updatedAt: new Date() } }
      );

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      res.status(500).json({ error: 'Failed to update notifications' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 