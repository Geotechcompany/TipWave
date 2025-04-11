import { NextApiRequest, NextApiResponse } from 'next';
import { getCollection } from '../../../../lib/db';
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const notifications = await getCollection('notifications');
    
    await notifications.updateMany(
      { userId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
} 