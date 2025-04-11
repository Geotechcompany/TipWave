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
    const activities = await getCollection('activities');
    
    const recentActivities = await activities
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    res.status(200).json(recentActivities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
} 