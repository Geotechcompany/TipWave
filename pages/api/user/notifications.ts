import { NextApiRequest, NextApiResponse } from 'next';
import { getCollection } from '../../../lib/db';
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const notifications = await getCollection('notifications');
    
    const userNotifications = await notifications
      .find({ userId, read: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    res.status(200).json(userNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
} 